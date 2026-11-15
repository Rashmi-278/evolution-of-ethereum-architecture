(async function () {
  const [A, E, S] = await Promise.all(["../data/architecture.json", "../data/engineers.json", "../data/status.json"].map(u => fetch(u).then(r => r.json())));
  const N = A.stages.length;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const G = { el: { c: "#3D4CEB", t: "#2B35A6", f: "#F3F7FF", n: "Execution" }, cl: { c: "#6C24E0", t: "#41128C", f: "#F8F4FF", n: "Consensus" },
    vc: { c: "#D10F86", t: "#8A0B59", f: "#FFF4FA", n: "Validator" }, ext: { c: "#0F9972", t: "#0B5F48", f: "#F2FFFB", n: "External" }, net: { c: "#616161", t: "#121212", f: "#F7F7F7", n: "Network" } };
  const HOT = { new: "#16A249", ch: "#6C24E0", fut: "#3D4CEB", res: "#8C8C8C" };
  const STATUS = { live: "LIVE ON MAINNET", testnet: "ON TESTNET", planned: "PLANNED", research: "RESEARCH" };
  const at = (ev, j) => { let c = null; for (const e of ev) if (e[0] <= j) c = e; return c; };
  let i, timer = null;
  const TL = EEATimeline($("tl"), A.stages, k => { stop(); go(k); });
  i = TL.lastLive;

  function T(x, y, s, o = {}) {
    return `<text x="${x}" y="${y}" font-size="${o.size || 14}" font-weight="${o.w || 400}" fill="${o.fill || "#121212"}"${o.anchor ? ` text-anchor="${o.anchor}"` : ""}${o.mono ? ' font-family="IBM Plex Mono, monospace"' : ""}>${esc(s)}</text>`;
  }
  function render() {
    const st = A.stages[i], fut = st.status !== "live";
    const hotKind = first => st.status === "research" ? "res" : fut ? "fut" : first ? "new" : "ch";
    const o = [];
    o.push(`<svg viewBox="0 80 1600 950" xmlns="http://www.w3.org/2000/svg" font-family="Inter, sans-serif" role="img" aria-label="Ethereum node engineering view at ${esc(st.name)}">`);
    o.push(`<defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#616161"/></marker></defs>`);
    o.push(`<rect y="80" width="1600" height="950" fill="#FFFFFF"/>`);
    // containers
    for (const [k, c] of Object.entries(E.containers)) {
      const g = G[k];
      if (i < c.from) {
        if (k === "cl") {
          o.push(`<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="16" fill="none" stroke="#CFCFCF" stroke-dasharray="6 6"/>`);
          o.push(T(c.x + c.w / 2, c.y + c.h / 2 - 8, "No consensus client yet", { size: 18, w: 600, fill: "#8C8C8C", anchor: "middle" }));
          o.push(T(c.x + c.w / 2, c.y + c.h / 2 + 18, "Proof of work runs inside the one client (the miner)", { size: 14, fill: "#8C8C8C", anchor: "middle" }));
        }
        continue;
      }
      const tt = at(c.titles, i), hot = tt[0] === i;
      const sc = hot ? HOT[hotKind(tt[0] === c.from)] : g.c;
      o.push(`<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="16" fill="${g.f}" stroke="${sc}" stroke-width="${hot ? 2.6 : 1.2}"${hot && fut ? ' stroke-dasharray="9 6"' : ""}/>`);
      o.push(T(c.x + 20, c.y + 28, tt[1], { size: 16, w: 700, fill: g.t }));
      o.push(T(c.x + 20, c.y + 47, tt[2], { size: 12.5, fill: "#616161" }));
    }
    // components
    for (const c of E.components) {
      const e = at(c.ev, i); if (!e) continue;
      const g = G[c.g], hot = e[0] === i, kind = hot ? hotKind(e[0] === c.ev[0][0]) : null;
      const stroke = hot ? HOT[kind] : (c.g === "ext" || c.g === "net" ? g.c : "#CFCFCF");
      const fill = hot ? (kind === "new" ? "#F2FDF5" : kind === "ch" ? "#F2EBFF" : kind === "fut" ? "#E5EFFF" : "#F7F7F7") : (c.g === "ext" || c.g === "net" ? g.f : "#FFFFFF");
      const dash = (hot && fut) ? (st.status === "research" ? ' stroke-dasharray="2 5"' : ' stroke-dasharray="8 5"') : (c.dash ? ' stroke-dasharray="6 4"' : "");
      o.push(`<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="${c.small ? 8 : 10}" fill="${fill}" stroke="${stroke}" stroke-width="${hot ? 2.4 : 1.2}"${dash}/>`);
      const tx = c.x + 14;
      if (c.small) { o.push(T(tx, c.y + 27, e[1], { size: 13.5, w: 600 })); }
      else {
        o.push(T(tx, c.y + 26, e[1], { size: c.wide ? 14.5 : 15, w: 600 }));
        if (e[2]) o.push(T(tx, c.y + 46, e[2], { size: 12.5, fill: "#616161" }));
        if (e[3]) o.push(T(tx, c.y + 64, e[3], { size: 12, fill: "#616161", mono: true }));
      }
      if (hot) {
        const lab = fut ? st.status.toUpperCase() : kind === "new" ? "NEW" : "CHANGED", bw = lab.length * 7 + 16;
        o.push(`<rect x="${c.x + c.w - bw - 8}" y="${c.y - 9}" width="${bw}" height="18" rx="9" fill="${HOT[kind]}"/>`);
        o.push(T(c.x + c.w - bw / 2 - 8, c.y + 4, lab, { size: 10.5, w: 700, fill: "#FFFFFF", anchor: "middle", mono: true }));
      }
    }
    // Engine API bridge (or deposit polling before the Merge)
    if (i >= 5) {
      o.push(`<line x1="742" y1="391" x2="858" y2="391" stroke="#616161" stroke-width="1.8" marker-start="url(#a)" marker-end="url(#a)"/>`);
      o.push(T(800, 378, "Engine API", { size: 13, w: 700, anchor: "middle" }));
      o.push(T(800, 412, ":8551", { size: 11.5, fill: "#616161", anchor: "middle", mono: true }));
      o.push(T(800, 427, "JWT", { size: 11.5, fill: "#616161", anchor: "middle", mono: true }));
    } else if (i === 4) {
      o.push(`<line x1="858" y1="391" x2="742" y2="391" stroke="#616161" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#a)"/>`);
      o.push(T(800, 378, "JSON-RPC", { size: 12, w: 600, anchor: "middle" }));
      o.push(T(800, 412, "reads", { size: 11.5, fill: "#616161", anchor: "middle" }));
      o.push(T(800, 427, "deposits", { size: 11.5, fill: "#616161", anchor: "middle" }));
    }
    for (const f of E.flows) {
      if (i < f.from) continue;
      if ((f.id === "mevapi" || f.id === "relay") && !at(E.components.find(c => c.id === "mev").ev, i)) continue;
      const [x1, y1, x2, y2] = f.line;
      const dash = (f.id === "mevapi" && i >= 10) ? ' stroke-dasharray="5 4"' : "";
      o.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#616161" stroke-width="1.6"${dash} marker-end="url(#a)"${f.both ? ' marker-start="url(#a)"' : ""}/>`);
      (f.label || []).forEach((l, k) => o.push(T(f.lx, f.ly + k * 16, l, { size: k ? 11.5 : 12.5, w: k ? 400 : 600, fill: k ? "#616161" : "#121212", mono: k > 0, anchor: f.anchor })));
    }
    // sequence strip
    const seq = at(E.sequences.map(s => [s.from, s]), i)[1];
    o.push(T(40, 912, seq.title, { size: 17, w: 700 }));
    const w = 243;
    seq.steps.forEach((s, k) => {
      const x = 40 + k * (w + 12), y = 928;
      o.push(`<rect x="${x}" y="${y}" width="${w}" height="82" rx="10" fill="${fut ? "#F5F8FF" : "#FFFFFF"}" stroke="${fut ? "#3D4CEB" : "#CFCFCF"}"${fut ? ' stroke-dasharray="7 5"' : ""}/>`);
      o.push(`<circle cx="${x + 22}" cy="${y + 24}" r="11" fill="${fut ? "#3D4CEB" : "#6C24E0"}"/>`);
      o.push(T(x + 22, y + 28.5, String(k + 1), { size: 12, w: 700, fill: "#FFFFFF", anchor: "middle", mono: true }));
      o.push(T(x + 42, y + 29, s[0], { size: 15, w: 700 }));
      const words = s[1].split(" "); let l1 = "", l2 = "";
      for (const wd of words) { if ((l1 + " " + wd).trim().length <= 32 && !l2) l1 = (l1 + " " + wd).trim(); else l2 = (l2 + " " + wd).trim(); }
      o.push(T(x + 14, y + 54, l1, { size: 12.5, fill: "#616161" })); if (l2) o.push(T(x + 14, y + 71, l2, { size: 12.5, fill: "#616161" }));
      if (k < 5) o.push(`<line x1="${x + w + 1}" y1="${y + 41}" x2="${x + w + 11}" y2="${y + 41}" stroke="#616161" stroke-width="1.6" marker-end="url(#a)"/>`);
    });
    o.push(`</svg>`);
    return o.join("");
  }

  function changes() {
    const st = A.stages[i], out = [];
    for (const [k, c] of Object.entries(E.containers)) { const t = at(c.titles, i); if (t && t[0] === i) out.push([G[k].n, t[1]]); }
    for (const c of E.components) { const e = at(c.ev, i); if (e && e[0] === i) out.push([G[c.g].n, `${e[1]}${e[3] ? ": " + e[3] : e[2] ? ": " + e[2] : ""}`]); }
    if (i === 5) out.unshift(["Execution", "Miner removed. The Engine API takes its place."]);
    return out;
  }

  function draw() {
    const st = A.stages[i], fut = st.status !== "live";
    $("dia").innerHTML = render();
    const ch = changes();
    const shown = ch.slice(0, 5), more = ch.length - shown.length;
    $("head").innerHTML = `<div class="hd-l"><span class="pill ${st.status}">${STATUS[st.status]}</span><h2>${esc(st.name)}</h2><div class="sub">${esc(st.date)}${st.sub ? " · " + esc(st.sub) : ""}</div>
        <div class="ctl"><button class="btn" id="pv" aria-label="Previous upgrade">←</button><button class="btn" id="pl">${timer ? "❚❚ Pause" : "▶ Play 2015 → today"}</button><button class="btn" id="nx" aria-label="Next upgrade">→</button></div></div>
      <div class="hd-r">${fut ? `<div class="preview"><b>Preview</b> ${st.status === "research" ? "Research direction. Nothing is scheduled." : st.status === "testnet" ? "On testnets now. Not on mainnet yet." : "Planned. Scope can still change."}</div>` : ""}
        <h3>${fut ? "What will change in the node" : "What changed in the node"}</h3>
        ${shown.length ? `<ol>${shown.map(c => `<li><em>${esc(c[0])}</em>${esc(c[1])}</li>`).join("")}</ol>${more > 0 ? `<div class="more">+ ${more} more, highlighted in the drawing</div>` : ""}` : `<p class="sub">No change to the node software. This upgrade changes rules inside the EVM and consensus.</p>`}
        ${!fut && i === TL.lastLive && !timer ? `<div class="more"><a href="#${A.stages[i + 1].id}">Preview what comes next: ${esc(A.stages[i + 1].name)} →</a></div>` : ""}</div>`;
    $("pv").onclick = () => { stop(); go(i - 1); }; $("nx").onclick = () => { stop(); go(i + 1); }; $("pl").onclick = play;
    TL.set(i);
  }
  function go(j) { i = Math.max(0, Math.min(N - 1, j)); try { history.replaceState(null, "", "#" + A.stages[i].id); } catch (e) {} draw(); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function play() {
    if (timer) { stop(); draw(); return; }
    timer = setInterval(() => { if (i >= TL.lastLive) { stop(); draw(); return; } go(i + 1); }, 3600); go(0);
  }
  document.addEventListener("keydown", e => { if (e.key === "ArrowRight") { stop(); go(i + 1); } if (e.key === "ArrowLeft") { stop(); go(i - 1); } });
  window.addEventListener("hashchange", () => { const k = A.stages.findIndex(s => s.id === location.hash.slice(1)); if (k >= 0 && k !== i) { i = k; draw(); } });
  const k0 = A.stages.findIndex(s => s.id === location.hash.slice(1)); if (k0 >= 0) i = k0;
  $("dl").onclick = () => { const b = new Blob([render()], { type: "image/svg+xml" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `ethereum-node-${A.stages[i].id}.svg`; a.click(); };
  $("foot").innerHTML = `<span>Specs checked: ${esc(S.checked_at)}</span><a href="../index.html">← Architecture</a>`;
  draw();
})();
