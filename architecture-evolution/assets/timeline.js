// Shared timeline: shipped upgrades up to today, then upcoming ones you can click to preview.
window.EEATimeline = function (root, stages, onSelect) {
  const SHORT = { metropolis: "Metropolis", homestead: "Homestead", "beacon-london": "Beacon + London", lean: "Lean era" };
  const YEAR = { glamsterdam: "testnet", hegota: "2027 · planned", lean: "research", metropolis: "2017–19", homestead: "2016", "beacon-london": "2020–21" };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const N = stages.length;
  const lastLive = stages.map(s => s.status).lastIndexOf("live");
  root.classList.add("tl2");
  const cols = `${lastLive + 1}fr ${(N - lastLive - 1) * 1.5}fr`;
  root.innerHTML = `<div class="tl-groups">
      <div class="tl-g live"><span>Shipped · 2015 → today</span></div>
      <div class="tl-g up"></div>
    </div>
    <div class="tl-row"><div class="tl-live"></div><div class="tl-up"></div></div>`;
  root.querySelectorAll(".tl-groups, .tl-row").forEach(el => el.style.gridTemplateColumns = cols);
  const live = root.querySelector(".tl-live"), up = root.querySelector(".tl-up");
  stages.forEach((s, j) => {
    const b = document.createElement("button");
    b.className = "stop " + s.status; b.dataset.j = j;
    b.setAttribute("aria-label", `${s.name}${s.status === "live" ? "" : ", upcoming: preview"}`);
    b.innerHTML = `<i></i>${esc(SHORT[s.id] || s.name)}<span>${esc(YEAR[s.id] || (s.date.match(/\d{4}/) || [""])[0])}</span>`;
    b.onclick = () => onSelect(j);
    (j <= lastLive ? live : up).appendChild(b);
  });
  const today = document.createElement("div"); today.className = "today"; today.innerHTML = "<b>today</b>";
  live.appendChild(today);
  return {
    lastLive,
    set(i) {
      root.querySelectorAll(".stop").forEach(b => { const j = +b.dataset.j; b.setAttribute("aria-current", j === i); b.classList.toggle("done", j < i && j <= lastLive); });
      if (window.innerWidth < 760) { const cur = root.querySelector('.stop[aria-current="true"]'); if (cur) root.scrollLeft = cur.offsetLeft - root.clientWidth / 2 + cur.offsetWidth / 2; }
    }
  };
};
