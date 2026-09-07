(() => {
  const STORAGE_KEY = "the-free-desk-kanban-v1";
  const WIP_LIMIT = 3;
  const COLS = ["todo", "doing", "done"];

  const SEED = [
    { id: "k1", title: "Clear inbox", col: "todo" },
    { id: "k2", title: "Draft outline", col: "todo" },
    { id: "k3", title: "File receipts", col: "todo" },
    { id: "k4", title: "Book dentist", col: "todo" },
    { id: "k5", title: "Weekly review", col: "doing" },
    { id: "k6", title: "Ship kanban demo", col: "done" },
  ];

  let cards = load();
  let bannerTimer = null;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneSeed();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return cloneSeed();
      return parsed;
    } catch {
      return cloneSeed();
    }
  }

  function cloneSeed() {
    return SEED.map((c) => ({ ...c }));
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }

  function doingCount() {
    return cards.filter((c) => c.col === "doing").length;
  }

  function showWipFull() {
    const banner = document.getElementById("wip-banner");
    banner.hidden = false;
    banner.classList.add("show");
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => {
      banner.classList.remove("show");
      banner.hidden = true;
    }, 2200);
  }

  function move(id, col) {
    const item = cards.find((c) => c.id === id);
    if (!item || item.col === col) return;
    if (col === "doing" && item.col !== "doing" && doingCount() >= WIP_LIMIT) {
      showWipFull();
      return;
    }
    item.col = col;
    save();
    render();
  }

  function addCard() {
    const n = cards.length + 1;
    cards.push({
      id: `k${Date.now()}`,
      title: `Outcome ${n}`,
      col: "todo",
    });
    save();
    render();
  }

  function reset() {
    cards = cloneSeed();
    save();
    render();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function buttons(id, current) {
    const labels = { todo: "To Do", doing: "Doing", done: "Done" };
    return COLS.filter((col) => col !== current)
      .map(
        (col) =>
          `<button type="button" data-move="${col}" data-id="${id}">→ ${labels[col]}</button>`
      )
      .join("");
  }

  function cardHtml(card) {
    return `
      <article class="card" data-id="${card.id}">
        <div class="from">${escapeHtml(card.title)}</div>
        <div class="actions">${buttons(card.id, card.col)}</div>
      </article>
    `;
  }

  function render() {
    for (const col of COLS) {
      const list = document.getElementById(col);
      const items = cards.filter((c) => c.col === col);
      list.innerHTML = items.map(cardHtml).join("") || "";
      if (col !== "doing") {
        document.getElementById(`count-${col}`).textContent = String(items.length);
      }
    }
    const wip = doingCount();
    document.getElementById("wip-now").textContent = String(wip);
    const badge = document.getElementById("wip-badge");
    badge.classList.toggle("full", wip >= WIP_LIMIT);
  }

  document.querySelector(".board").addEventListener("click", (ev) => {
    const btn = ev.target.closest("button[data-move]");
    if (!btn) return;
    move(btn.getAttribute("data-id"), btn.getAttribute("data-move"));
  });

  document.getElementById("add-card").addEventListener("click", addCard);
  document.getElementById("reset").addEventListener("click", reset);

  render();
})();
