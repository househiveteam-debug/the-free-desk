(() => {
  const STORAGE_KEY = "the-free-desk-demo-v1";
  const COLS = ["inbox", "action", "waiting", "reference"];

  const SEED = [
    {
      id: "e1",
      from: "Alex Chen",
      subject: "Can you confirm the venue for Thursday?",
      col: "inbox",
    },
    {
      id: "e2",
      from: "Stripe",
      subject: "Your receipt for Free Desk tools — $0.00",
      col: "inbox",
    },
    {
      id: "e3",
      from: "Jordan Lee",
      subject: "Waiting on your feedback on the draft",
      col: "inbox",
    },
    {
      id: "e4",
      from: "Council",
      subject: "Parking permit renewal guide (PDF)",
      col: "inbox",
    },
    {
      id: "e5",
      from: "Sam Rivera",
      subject: "Quick yes/no: lunch next week?",
      col: "inbox",
    },
    {
      id: "e6",
      from: "Notion",
      subject: "Weekly digest — unread mentions",
      col: "inbox",
    },
  ];

  let emails = load();

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
    return SEED.map((e) => ({ ...e }));
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
  }

  function move(id, col) {
    const item = emails.find((e) => e.id === id);
    if (!item) return;
    item.col = col;
    save();
    render();
  }

  function archive(id) {
    emails = emails.filter((e) => e.id !== id);
    save();
    render();
  }

  function reset() {
    emails = cloneSeed();
    save();
    render();
  }

  function fileButtons(id, current) {
    const targets = [
      ["action", "Action"],
      ["waiting", "Waiting"],
      ["reference", "Reference"],
      ["inbox", "Inbox"],
    ].filter(([col]) => col !== current);

    return (
      targets
        .map(
          ([col, label]) =>
            `<button type="button" data-move="${col}" data-id="${id}">→ ${label}</button>`
        )
        .join("") +
      `<button type="button" class="danger" data-archive="1" data-id="${id}">Archive</button>`
    );
  }

  function cardHtml(email) {
    return `
      <article class="card" data-id="${email.id}">
        <div class="from">${escapeHtml(email.from)}</div>
        <div class="subject">${escapeHtml(email.subject)}</div>
        <div class="actions">${fileButtons(email.id, email.col)}</div>
      </article>
    `;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render() {
    for (const col of COLS) {
      const list = document.getElementById(col);
      const count = document.getElementById(`count-${col}`);
      const items = emails.filter((e) => e.col === col);
      list.innerHTML = items.map(cardHtml).join("") || "";
      count.textContent = String(items.length);
    }
  }

  document.querySelector(".board").addEventListener("click", (ev) => {
    const btn = ev.target.closest("button[data-id]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    if (btn.hasAttribute("data-archive")) {
      archive(id);
      return;
    }
    const col = btn.getAttribute("data-move");
    if (col) move(id, col);
  });

  document.getElementById("reset").addEventListener("click", reset);

  render();
})();
