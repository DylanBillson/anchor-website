(() => {
  const root = document.querySelector("[data-events]");
  if (!root) return;

  const grid = root.querySelector("[data-events-grid]");
  const emptyEl = root.querySelector("[data-events-empty]");
  const searchInput = root.querySelector("[data-events-search]");
  const filterWrap = root.querySelector("[data-filter-buttons]");
  const allBtn = root.querySelector('[data-filter="all"]');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cards = Array.from(root.querySelectorAll("[data-event]"));

  const parseDate = (dateStr) => {
    // dateStr = YYYY-MM-DD
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, (m - 1), d);
  };

  const formatDate = (dateStr, timeStr) => {
    const dt = parseDate(dateStr);
    const opts = { weekday: "short", day: "2-digit", month: "short", year: "numeric" };
    const datePart = dt.toLocaleDateString("en-GB", opts);
    return timeStr ? `${datePart} • ${timeStr}` : datePart;
  };

  // Collect tags
  const tagSet = new Set();
  cards.forEach((c) => {
    const tags = (c.dataset.tags || "").split("|").filter(Boolean);
    tags.forEach((t) => tagSet.add(t));
  });
  const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b, "en"));

  // Build filter buttons
  const makeBtn = (label) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "events__filter";
    b.textContent = label;
    b.dataset.filter = label;
    return b;
  };

  tags.forEach((t) => filterWrap.appendChild(makeBtn(t)));

  let activeFilter = "all";
  let query = "";

  const setActiveButton = () => {
    root.querySelectorAll(".events__filter").forEach((b) => b.classList.remove("is-active"));
    const sel = activeFilter === "all" ? allBtn : root.querySelector(`.events__filter[data-filter="${CSS.escape(activeFilter)}"]`);
    if (sel) sel.classList.add("is-active");
  };

  const isPastEvent = (card) => {
    const dt = parseDate(card.dataset.date);
    return dt < today;
  };

  // Sort cards: pinned first, then by date ascending
  const sorted = cards.slice().sort((a, b) => {
    const ap = a.dataset.pinned === "true";
    const bp = b.dataset.pinned === "true";
    if (ap !== bp) return ap ? -1 : 1;

    const ad = parseDate(a.dataset.date).getTime();
    const bd = parseDate(b.dataset.date).getTime();
    return ad - bd;
  });

  // Apply formatted date labels
  sorted.forEach((c) => {
    const dateEl = c.querySelector("[data-event-date]");
    if (dateEl) dateEl.textContent = formatDate(c.dataset.date, c.dataset.time || "");
  });

  // Render in sorted order
  sorted.forEach((c) => grid.appendChild(c));

  const matches = (card) => {
    // hide past events always
    if (isPastEvent(card)) return false;

    // filter by tag
    if (activeFilter !== "all") {
      const tags = (card.dataset.tags || "").split("|").filter(Boolean);
      if (!tags.includes(activeFilter)) return false;
    }

    // search
    if (query) {
      const hay = `${card.dataset.title || ""} ${card.dataset.description || ""}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }

    return true;
  };

  const update = () => {
    let visible = 0;
    sorted.forEach((card) => {
      const ok = matches(card);
      card.hidden = !ok;
      if (ok) visible++;
    });

    if (emptyEl) emptyEl.hidden = visible !== 0;
    setActiveButton();
  };

  // Filter button clicks
  root.addEventListener("click", (e) => {
    const btn = e.target.closest(".events__filter");
    if (!btn) return;

    const val = btn.dataset.filter;
    if (!val) return;

    activeFilter = val === "all" ? "all" : val;
    update();
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      query = (searchInput.value || "").trim().toLowerCase();
      update();
    });
  }

  // Initial state
  setActiveButton();
  update();
})();
