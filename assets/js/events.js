(() => {
  const root = document.querySelector("[data-events-api]");
  if (!root) return;

  const apiUrl = root.dataset.eventsApiUrl;
  const controls = document.getElementById("events-controls");
  const loadingEl = document.getElementById("events-loading");
  const errorEl = document.getElementById("events-error");
  const emptyEl = document.getElementById("events-empty");
  const gridEl = document.getElementById("events-grid");
  const filterWrap = document.getElementById("events-filter-buttons");
  const allBtn = root.querySelector('[data-filter="all"]');
  const searchInput = document.getElementById("events-search");

  const featuredSection = document.getElementById("api-featured-event");
  const featuredTitle = document.getElementById("api-featured-title");
  const featuredText = document.getElementById("api-featured-text");
  const featuredMeta = document.getElementById("api-featured-meta");
  const featuredPoster = document.getElementById("api-featured-poster");

  let events = [];
  let filteredEvents = [];
  let activeFilter = "all";
  let query = "";

  const today = new Date();

  const apiOrigin = (() => {
    try {
      return new URL(apiUrl).origin;
    } catch (e) {
      return "";
    }
  })();

  const resolveAssetUrl = (value) => {
    if (!value) return "";
    try {
      return new URL(value, apiOrigin).href;
    } catch (e) {
      return value;
    }
  };

  const parseDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const parseEventDate = (event) => {
    return parseDate(event.start_at) || parseDate(`${event.date}T23:59:59`);
  };

  const isUpcoming = (event) => {
    const d = parseEventDate(event);
    return d && d >= today;
  };

  const sortByNearest = (a, b) => {
    const ad = parseEventDate(a)?.getTime() || 0;
    const bd = parseEventDate(b)?.getTime() || 0;
    return ad - bd;
  };

  const formatDateTime = (event) => {
    const start = parseDate(event.start_at);
    if (!start) {
      return event.date || "";
    }

    const datePart = start.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    if (event.public_timing_note && event.public_timing_note.trim() !== "") {
      return `${datePart} • ${event.public_timing_note.trim()}`;
    }

    const timePart = start.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    });

    return `${datePart} • ${timePart}`;
  };

  const escapeHtml = (value) => {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  const buildEventCard = (event) => {
    const categories = Array.isArray(event.categories) ? event.categories : [];
    const formattedDate = formatDateTime(event);
    const desc = event.description ? `<p class="event-card__desc">${escapeHtml(event.description)}</p>` : "";

    const tags = categories.length
      ? `
        <div class="event-card__tags" aria-label="Event categories">
          ${categories
            .map((tag) => `<span class="event-tag">${escapeHtml(tag)}</span>`)
            .join("")}
        </div>
      `
      : "";

    return `
      <article class="event-card" data-event-card data-categories="${escapeHtml(categories.join("|"))}">
        <header class="event-card__header">
          <h3 class="event-card__title">${escapeHtml(event.title)}</h3>
          <p class="event-card__date">${escapeHtml(formattedDate)}</p>
        </header>
        ${desc}
        ${tags}
      </article>
    `;
  };

  const renderFeatured = (items) => {
    if (!featuredSection || !featuredTitle || !featuredText || !featuredMeta || !featuredPoster) return;

    const featured = items
      .filter((event) => event.advertise_as_special === true && event.poster_png_url)
      .sort(sortByNearest)[0];

    if (!featured) {
      featuredSection.hidden = true;
      return;
    }

    featuredTitle.textContent = featured.title || "";
    featuredText.textContent = featured.description || "";
    featuredMeta.textContent = formatDateTime(featured);
    featuredPoster.src = resolveAssetUrl(featured.poster_png_url);
    featuredPoster.alt = featured.title ? `${featured.title} poster` : "Featured event poster";

    featuredSection.hidden = false;
  };

  const renderCategoryButtons = (items) => {
    if (!filterWrap) return;

    const categories = Array.from(
      new Set(
        items.flatMap((event) =>
          Array.isArray(event.categories) ? event.categories : []
        )
      )
    ).sort((a, b) => a.localeCompare(b, "en"));

    filterWrap.innerHTML = categories
      .map(
        (category) =>
          `<button type="button" class="events__filter" data-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>`
      )
      .join("");
  };

  const applyFilters = () => {
    filteredEvents = events.filter((event) => {
      const matchesCategory =
        activeFilter === "all" ||
        (Array.isArray(event.categories) && event.categories.includes(activeFilter));

      const haystack = `${event.title || ""} ${event.description || ""} ${(event.categories || []).join(" ")}`
        .toLowerCase();

      const matchesSearch = !query || haystack.includes(query);

      return matchesCategory && matchesSearch;
    });

    renderGrid();
    updateFilterButtons();
  };

  const renderGrid = () => {
    if (!gridEl || !emptyEl) return;

    if (!filteredEvents.length) {
      gridEl.hidden = true;
      emptyEl.hidden = false;
      gridEl.innerHTML = "";
      return;
    }

    emptyEl.hidden = true;
    gridEl.hidden = false;
    gridEl.innerHTML = filteredEvents.map(buildEventCard).join("");
  };

  const updateFilterButtons = () => {
    root.querySelectorAll(".events__filter").forEach((btn) => {
      const value = btn.dataset.filter || "";
      btn.classList.toggle("is-active", value === activeFilter);
    });
  };

  const setLoadedState = () => {
    if (loadingEl) loadingEl.hidden = true;
    if (errorEl) errorEl.hidden = true;
    if (controls) controls.hidden = false;
  };

  const setErrorState = () => {
    if (loadingEl) loadingEl.hidden = true;
    if (controls) controls.hidden = true;
    if (gridEl) gridEl.hidden = true;
    if (emptyEl) emptyEl.hidden = true;
    if (errorEl) errorEl.hidden = false;
    if (featuredSection) featuredSection.hidden = true;
  };

  root.addEventListener("click", (event) => {
    const btn = event.target.closest(".events__filter");
    if (!btn) return;
    activeFilter = btn.dataset.filter || "all";
    applyFilters();
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      query = searchInput.value.trim().toLowerCase();
      applyFilters();
    });
  }

  const init = async () => {
    if (!apiUrl) {
      setErrorState();
      return;
    }

    try {
      const response = await fetch(apiUrl, { method: "GET" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const results = Array.isArray(data.results) ? data.results : [];

      events = results.filter(isUpcoming).sort(sortByNearest);

      setLoadedState();
      renderFeatured(events);
      renderCategoryButtons(events);
      applyFilters();
    } catch (error) {
      setErrorState();
    }
  };

  init();
})();