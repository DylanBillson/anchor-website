(() => {
  const root = document.querySelector("[data-gallery]");
  if (!root) return;

  const grid = root.querySelector("[data-gallery-grid]");
  const emptyEl = root.querySelector("[data-gallery-empty]");
  const searchInput = root.querySelector("[data-gallery-search]");
  const filterWrap = root.querySelector("[data-filter-buttons]");
  const allBtn = root.querySelector('[data-filter="all"]');
  const yearSelect = root.querySelector("[data-gallery-year-filter]");

  const cards = Array.from(root.querySelectorAll("[data-item]"));

  const parseDate = (dateStr) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, (m - 1), d);
  };

  const formatDate = (dateStr) => {
    const dt = parseDate(dateStr);
    const opts = { weekday: "short", day: "2-digit", month: "short", year: "numeric" };
    return dt.toLocaleDateString("en-GB", opts);
  };

  const renderMedia = (card) => {
    const type = card.dataset.type;
    const mediaUrl = card.dataset.mediaUrl;
    const thumbUrl = card.dataset.thumbUrl || "";
    const mediaEl = card.querySelector("[data-media]");
    if (!mediaEl) return;

    mediaEl.innerHTML = "";

    if (type === "image") {
      const img = document.createElement("img");
      img.src = mediaUrl;
      img.alt = card.dataset.title || "";
      img.loading = "lazy";
      img.decoding = "async";
      img.className = "gallery-card__img";

      const a = document.createElement("a");
      a.href = mediaUrl;
      a.target = "_blank";
      a.rel = "noopener";
      a.appendChild(img);

      mediaEl.appendChild(a);
      return;
    }

    const a = document.createElement("a");
    a.href = mediaUrl;
    a.target = "_blank";
    a.rel = "noopener";
    a.className = "gallery-card__video-link";
    a.setAttribute("aria-label", `Open video: ${card.dataset.title || "Video"}`);

    if (thumbUrl) {
      const img = document.createElement("img");
      img.src = thumbUrl;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.className = "gallery-card__img";
      a.appendChild(img);
    } else {
      const div = document.createElement("div");
      div.className = "gallery-card__video-fallback";
      div.textContent = "Video";
      a.appendChild(div);
    }

    const badge = document.createElement("span");
    badge.className = "gallery-card__badge";
    badge.textContent = "Video";
    a.appendChild(badge);

    mediaEl.appendChild(a);
  };

  // Tags
  const tagSet = new Set();
  cards.forEach((c) => {
    const tags = (c.dataset.tags || "").split("|").filter(Boolean);
    tags.forEach((t) => tagSet.add(t));
  });

  Array.from(tagSet)
    .sort((a, b) => a.localeCompare(b, "en"))
    .forEach((tag) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery__filter";
      button.textContent = tag;
      button.dataset.filter = tag;
      filterWrap.appendChild(button);
    });

  // Years
  const years = Array.from(
    new Set(
      cards
        .map((card) => (card.dataset.date || "").slice(0, 4))
        .filter(Boolean)
    )
  ).sort((a, b) => b.localeCompare(a));

  if (yearSelect) {
    years.forEach((year) => {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });
  }

  // Sort: pinned first, then newest first
  const sorted = cards.slice().sort((a, b) => {
    const ap = a.dataset.pinned === "true";
    const bp = b.dataset.pinned === "true";
    if (ap !== bp) return ap ? -1 : 1;

    const ad = parseDate(a.dataset.date).getTime();
    const bd = parseDate(b.dataset.date).getTime();
    return bd - ad;
  });

  sorted.forEach((card) => {
    const dateEl = card.querySelector("[data-date-label]");
    if (dateEl) dateEl.textContent = formatDate(card.dataset.date);

    if (card.dataset.pinned === "true") {
      card.classList.add("gallery-card--pinned");
      card.setAttribute("aria-label", `${card.dataset.title || "Gallery item"} — pinned`);
    }

    renderMedia(card);
    grid.appendChild(card);
  });

  let activeFilter = "all";
  let activeYear = "all";
  let query = "";

  const setActiveButton = () => {
    root.querySelectorAll(".gallery__filter").forEach((button) => {
      button.classList.remove("is-active");
    });

    const selected =
      activeFilter === "all"
        ? allBtn
        : root.querySelector(`.gallery__filter[data-filter="${CSS.escape(activeFilter)}"]`);

    if (selected) selected.classList.add("is-active");
  };

  const matches = (card) => {
    if (activeFilter !== "all") {
      const tags = (card.dataset.tags || "").split("|").filter(Boolean);
      if (!tags.includes(activeFilter)) return false;
    }

    if (activeYear !== "all") {
      const year = (card.dataset.date || "").slice(0, 4);
      if (year !== activeYear) return false;
    }

    if (query) {
      const haystack = `${card.dataset.title || ""} ${(card.dataset.tags || "").replaceAll("|", " ")}`
        .toLowerCase();

      if (!haystack.includes(query)) return false;
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

  root.addEventListener("click", (event) => {
    const button = event.target.closest(".gallery__filter");
    if (!button) return;

    activeFilter = button.dataset.filter || "all";
    update();
  });

  if (yearSelect) {
    yearSelect.addEventListener("change", () => {
      activeYear = yearSelect.value || "all";
      update();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      query = (searchInput.value || "").trim().toLowerCase();
      update();
    });
  }

  setActiveButton();
  update();
})();