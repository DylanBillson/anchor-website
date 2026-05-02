(() => {
  const root = document.querySelector("[data-blog-grid]");
  if (!root) return;

  const searchInput = root.querySelector("[data-blog-search]");
  const cards = Array.from(root.querySelectorAll("[data-blog-card]"));
  const emptyEl = root.querySelector("[data-blog-empty]");

  const update = () => {
    const query = (searchInput?.value || "").trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const haystack = `${card.dataset.title || ""} ${card.dataset.description || ""} ${(card.dataset.tags || "").replaceAll("|", " ")}`.toLowerCase();
      const match = !query || haystack.includes(query);

      card.hidden = !match;
      if (match) visible++;
    });

    if (emptyEl) emptyEl.hidden = visible !== 0;
  };

  searchInput?.addEventListener("input", update);
  update();
})();