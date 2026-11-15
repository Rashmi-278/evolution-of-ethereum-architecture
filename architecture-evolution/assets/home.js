(async function () {
  const [A, H, S] = await Promise.all(["data/architecture.json", "data/home.json", "data/status.json"].map(u => fetch(u).then(r => r.json())));
  const N = A.stages.length;
  const STATUS = { live: "LIVE ON MAINNET", testnet: "ON TESTNET", planned: "PLANNED", research: "RESEARCH" };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const $ = id => document.getElementById(id);
  let i = A.stages.findIndex(s => s.id === "fusaka"), timer = null;

  const TL = EEATimeline($("tl"), A.stages, k => { stop(); go(k); });
  const lastLive = TL.lastLive;
  i = lastLive;

  // diagram skeleton (960 x 480)
  const BL = { accounts: [10, 10, 460, 80], building: [490, 10, 460, 80], consensus: [30, 160, 400, 80], execution: [530, 160, 400, 80],
    state: [530, 252, 400, 80], data: [10, 378, 620, 116], l2: [650, 378, 300, 116] };
  let svg = `<svg viewBox="0 0 960 500" xmlns="http://www.w3.org/2000/svg" font-family="Inter, sans-serif">
  <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#616161"/></marker></defs>
  <rect class="nodebox" x="10" y="118" width="940" height="232" rx="16"/>
  <text class="nodelab" id="nodelab" x="30" y="146"></text>
  <line class="ln" x1="240" y1="92" x2="240" y2="116" marker-end="url(#ah)"/><line class="ln" x1="720" y1="92" x2="720" y2="116" marker-end="url(#ah)"/>
  <g id="eng"><line class="ln" id="engl" x1="433" y1="200" x2="527" y2="200" marker-start="url(#ah)" marker-end="url(#ah)"/><text class="lnl" id="engt" x="480" y="186" text-anchor="middle"></text></g>
  <line class="ln" x1="320" y1="352" x2="320" y2="376" marker-end="url(#ah)"/><text class="lnl" x="332" y="369">block data</text>
  <line class="ln" id="l2ln" x1="648" y1="436" x2="634" y2="436" marker-end="url(#ah)"/>
  <g class="b" id="b-gas"><rect class="box" x="30" y="252" width="400" height="80" rx="12"/><text class="lab" x="48" y="276">BLOCK GAS LIMIT</text>
    <rect class="gas-bg" x="48" y="298" width="364" height="12" rx="6"/><rect class="gas-fg" id="gasfg" x="48" y="298" width="10" height="12" rx="6"/><text class="meta" id="gast" x="412" y="276" text-anchor="end"></text><text class="meta" x="48" y="326">1M</text><text class="meta" x="230" y="326" text-anchor="middle">30M</text><text class="meta" x="412" y="326" text-anchor="end">1B</text></g>`;
  for (const b of H.blocks) {
    const [x, y, w, h] = BL[b.id];
    svg += `<g class="b" id="b-${b.id}"><rect class="box" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/>
      <text class="lab" x="${x + 18}" y="${y + 24}">${esc(b.label.toUpperCase())}</text>
      <text class="txt" id="t-${b.id}" x="${x + 18}" y="${y + 56}"></text>
      <g class="badge" id="g-${b.id}" opacity="0"><rect x="${x + w - 112}" y="${y + 10}" width="100" height="18" rx="9"/><text id="gt-${b.id}" x="${x + w - 62}" y="${y + 23}" text-anchor="middle"></text></g></g>`;
  }
  svg += `<g id="sqs"></g><text class="meta" id="blobt" x="28" y="484"></text></svg>`;
  $("dia").innerHTML = svg;
  const sqs = $("sqs"); let sq = "";
  for (let k = 0; k < 21; k++) sq += `<rect class="sq e" id="sq${k}" x="${28 + k * 22}" y="${446}" width="16" height="16" rx="3"/>`;
  sqs.innerHTML = sq;

  const at = (ev, j) => { let c = null; for (const e of ev) if (e[0] <= j) c = e; return c; };
  function draw() {
    const s = A.stages[i], fut = s.status !== "live";
    for (const b of H.blocks) {
      const e = at(b.ev, i), g = $("b-" + b.id), t = $("t-" + b.id);
      g.setAttribute("class", "b");
      if (!e) { g.classList.add("off"); t.textContent = "not yet"; $("g-" + b.id).setAttribute("opacity", 0); continue; }
      const hot = e[0] === i;
      t.textContent = e[1];
      const max = (BL[b.id][2] - 36) / 10.2; t.style.fontSize = e[1].length > max ? Math.max(14, 19 * max / e[1].length) + "px" : "";
      if (hot) {
        g.classList.add("hot", s.status === "research" ? "res" : fut ? "fut" : e[2] === "new" ? "new" : "ch");
        $("gt-" + b.id).textContent = fut ? s.status.toUpperCase() : e[2] === "new" ? "NEW" : "CHANGED";
        $("g-" + b.id).setAttribute("opacity", 1);
        t.classList.remove("fade"); void t.getBBox(); t.classList.add("fade");
      } else $("g-" + b.id).setAttribute("opacity", 0);
    }
    const nl = at(H.node, i); $("nodelab").textContent = nl ? nl[1] : ""; $("nodelab").style.fill = nl && nl[0] === i && i > 0 ? (fut ? "var(--violet2)" : "var(--brand)") : "";
    $("engt").textContent = i >= 5 ? "Engine API" : i === 4 ? "not linked" : "one program";
    $("engl").style.display = i >= 4 ? "" : "none"; $("engl").style.strokeDasharray = i === 4 ? "4 4" : "";
    // gas
    const v = H.gasLimitM[i], frac = Math.max(0.02, Math.min(1, (Math.log10(Math.max(v, 1)) - 0) / 3));
    $("gasfg").setAttribute("width", (364 * frac).toFixed(1)); $("gast").textContent = H.gasNote[i];
    const gchg = i > 0 && H.gasLimitM[i] !== H.gasLimitM[i - 1];
    $("b-gas").setAttribute("class", "b" + (gchg ? " hot " + (s.status === "research" ? "res" : fut ? "fut" : "ch") : ""));
    // blobs
    const bl = H.blobs[i];
    for (let k = 0; k < 21; k++) $("sq" + k).setAttribute("class", "sq " + (bl && k < bl[0] ? "t" : bl && k < bl[1] ? "m" : "e"));
    $("sqs").style.display = bl ? "" : "none";
    $("blobt").textContent = bl ? `${bl[0]} target · ${bl[1]} max blobs per block (~128 KB each)` : i === N - 1 ? "Goal: far more blobs, checked by 2D sampling" : "";
    $("l2ln").style.display = at(H.blocks.find(b => b.id === "l2").ev, i) ? "" : "none";
    // panel
    const p = H.plain[i];
    const pv = fut ? `<div class="preview"><b>Preview</b> ${s.status === "research" ? "Research direction. Nothing is scheduled." : s.status === "testnet" ? "On testnets now. Not on mainnet yet." : "Planned. Scope can still change."}</div>` : "";
    $("panel").innerHTML = `<span class="pill ${s.status}">${STATUS[s.status]}</span>
      <h2>${esc(s.name)}</h2><div class="sub">${esc(s.date)}${s.sub ? " · " + esc(s.sub) : ""}</div>
      ${pv}<h3>${fut ? "What will change" : "What changed"}</h3><ol>${p.lines.map(l => `<li>${esc(l)}</li>`).join("")}</ol>
      <h3>Why it matters</h3><div class="why">${esc(p.why)}</div>
      <div class="ctl"><button class="btn" id="pv" aria-label="Previous upgrade">←</button><button class="btn" id="pl">${timer ? "❚❚ Pause" : "▶ Play 2015 → today"}</button><button class="btn" id="nx" aria-label="Next upgrade">→</button></div>
      ${!fut && i === lastLive && !timer ? `<div class="more"><a href="#${A.stages[lastLive + 1].id}" id="nextup">Preview what comes next: ${esc(A.stages[lastLive + 1].name)} →</a></div>` : ""}
      <div class="more"><a href="data-view/index.html#${s.id}">EIPs, spec folders and sources for ${esc(s.name)} →</a></div>`;
    $("pv").onclick = () => { stop(); go(i - 1); }; $("nx").onclick = () => { stop(); go(i + 1); }; $("pl").onclick = play;
    $("panel").classList.remove("fade"); void $("panel").offsetWidth; $("panel").classList.add("fade");
    TL.set(i);
    $("dia").setAttribute("aria-label", `${s.name}: ${p.lines.join(" ")}`);
  }
  function go(j) { i = Math.max(0, Math.min(N - 1, j)); try { history.replaceState(null, "", "#" + A.stages[i].id); } catch (e) {} draw(); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function play() {
    if (timer) { stop(); draw(); return; }
    timer = setInterval(() => { if (i >= lastLive) { stop(); draw(); return; } go(i + 1); }, 3200); go(0);
  }
  document.addEventListener("keydown", e => { if (e.key === "ArrowRight") { stop(); go(i + 1); } if (e.key === "ArrowLeft") { stop(); go(i - 1); } });
  window.addEventListener("hashchange", () => { const k = A.stages.findIndex(s => s.id === location.hash.slice(1)); if (k >= 0 && k !== i) { i = k; draw(); } });
  const k0 = A.stages.findIndex(s => s.id === location.hash.slice(1)); if (k0 >= 0) i = k0;
  $("foot").innerHTML = `<span>Specs checked: ${esc(S.checked_at)}</span><span>Next mainnet fork date: ${esc(S.next_mainnet || "not set")}</span><a href="https://github.com/Rashmi-278/evolution-of-ethereum-architecture">Source and data on GitHub</a><a href="https://rwxlabs.com">rwxlabs.com</a>`;
  draw();
})();
