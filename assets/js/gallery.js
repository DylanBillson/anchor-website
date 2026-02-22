(() => {
  const root = document.querySelector("[data-gallery]");
  if (!root) return;

  const grid = root.querySelector("[data-gallery-grid]");
  const emptyEl = root.querySelector("[data-gallery-empty]");
  const searchInput = root.querySelector("[data-gallery-search]");
  const filterWrap = root.querySelector("[data-filter-buttons]");
  const allBtn = root.querySelector('[data-filter="all"]');

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

  const isYouTube = (url) => /youtube\.com\/watch\?v=|youtu\.be\//i.test(url);
  const isVimeo = (url) => /vimeo\.com\/\d+/i.test(url);
  const isMp4 = (url) => /\.mp4(\?|#|$)/i.test(url);

  const youtubeId = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      return "";
    } catch {
      return "";
    }
  };

  const vimeoId = (url) => {
    const m = url.match(/vimeo\.com\/(\d+)/i);
    return m ? m[1] : "";
  };

  const renderMedia = (card) => {
    const type = card.dataset.type;
    const mediaUrl = card.dataset.mediaUrl;
    const thumbUrl = card.dataset.thumbUrl || "";
    const mediaEl = card.querySelector("[data-media]");
    if (!mediaEl) return;

    // Clear existing
    mediaEl.innerHTML = "";

    // IMAGE
    if (type === "image") {
      const img = document.createElement("img");
      img.src = mediaUrl;
      img.alt = card.dataset.title || "";
      img.loading = "lazy";
      img.decoding = "async";
      img.className = "gallery-card__img";

      // Clicking opens full image in new tab
      const a = document.createElement("a");
      a.href = mediaUrl;
      a.target = "_blank";
      a.rel = "noopener";
      a.appendChild(img);

      mediaEl.appendChild(a);
      return;
    }

    // VIDEO
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
      // Fallback thumbnail (simple)
      const div = document.createElement("div");
      div.className = "gallery-card__video-fallback";
      div.textContent = "Video";
      a.appendChild(div);
    }

    const badge = document.createElement("span");
    badge.className = "gallery-card__badge";
    badge.textContent = "Video";
    a.appendChild(badge);

    // OPTIONAL: embed YouTube/Vimeo on click? (We keep it simple: open new tab)
    // If you later want inline embeds, we can add a lightbox.

    mediaEl.appendChild(a);
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
    b.className = "gallery__filter";
    b.textContent = label;
    b.dataset.filter = label;
    return b;
  };
  tags.forEach((t) => filterWrap.appendChild(makeBtn(t)));

  // Sort: pinned first, then newest first
  const sorted = cards.slice().sort((a, b) => {
    const ap = a.dataset.pinned === "true";
    const bp = b.dataset.pinned === "true";
    if (ap !== bp) return ap ? -1 : 1;

    const ad = parseDate(a.dataset.date).getTime();
    const bd = parseDate(b.dataset.date).getTime();
    return bd - ad;
  });

  // Render in sorted order + format date + render media
  sorted.forEach((c) => {
    const dateEl = c.querySelector("[data-date-label]");
    if (dateEl) dateEl.textContent = formatDate(c.dataset.date);
    renderMedia(c);
    grid.appendChild(c);
  });

  let activeFilter = "all";
  let query = "";

  const setActiveButton = () => {
    root.querySelectorAll(".gallery__filter").forEach((b) => b.classList.remove("is-active"));
    const sel =
      activeFilter === "all"
        ? allBtn
        : root.querySelector(`.gallery__filter[data-filter="${CSS.escape(activeFilter)}"]`);
    if (sel) sel.classList.add("is-active");
  };

  const matches = (card) => {
    if (activeFilter !== "all") {
      const tags = (card.dataset.tags || "").split("|").filter(Boolean);
      if (!tags.includes(activeFilter)) return false;
    }

    if (query) {
      const hay = `${card.dataset.title || ""}`.toLowerCase();
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

  root.addEventListener("click", (e) => {
    const btn = e.target.closest(".gallery__filter");
    if (!btn) return;
    const val = btn.dataset.filter;
    if (!val) return;
    activeFilter = val === "all" ? "all" : val;
    update();
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      query = (searchInput.value || "").trim().toLowerCase();
      update();
    });
  }

  setActiveButton();
  update();
})();
