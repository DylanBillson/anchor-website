(() => {
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");

  // Dropdown elements (supports 1 dropdown; easy to extend later)
  const dropdown = document.querySelector("[data-dropdown]");
  const dropdownToggle = document.querySelector("[data-dropdown-toggle]");
  const dropdownMenu = document.querySelector("[data-dropdown-menu]");

  if (!nav || !navToggle) return;

  const setExpanded = (el, expanded) => {
    if (!el) return;
    el.setAttribute("aria-expanded", expanded ? "true" : "false");
  };

  // ---------------------------
  // Mobile nav toggle
  // ---------------------------
  const openNav = () => {
    nav.classList.add("is-open");
    navToggle.classList.add("is-open");
    setExpanded(navToggle, true);
    navToggle.setAttribute("aria-label", "Close menu");
  };

  const closeNav = () => {
    nav.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    setExpanded(navToggle, false);
    navToggle.setAttribute("aria-label", "Open menu");
  };

  navToggle.addEventListener("click", (e) => {
    e.preventDefault();
    const isOpen = nav.classList.contains("is-open");
    isOpen ? closeNav() : openNav();
  });

  // ---------------------------
  // Dropdown toggle
  // ---------------------------
  const openDropdown = () => {
    if (!dropdown) return;
    dropdown.classList.add("is-open");
    setExpanded(dropdownToggle, true);
  };

  const closeDropdown = () => {
    if (!dropdown) return;
    dropdown.classList.remove("is-open");
    setExpanded(dropdownToggle, false);
  };

  if (dropdown && dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = dropdown.classList.contains("is-open");
      isOpen ? closeDropdown() : openDropdown();
    });
  }

  // ---------------------------
  // Close on outside click
  // ---------------------------
  document.addEventListener("click", (e) => {
    const target = e.target;

    // Close dropdown if click outside it
    if (dropdown && dropdown.classList.contains("is-open")) {
      if (!dropdown.contains(target)) closeDropdown();
    }

    // Close mobile nav if open and click outside header/nav toggle + nav
    if (nav.classList.contains("is-open")) {
      const header = document.querySelector(".site-header");
      if (header && !header.contains(target)) closeNav();
    }
  });

  // ---------------------------
  // Close on Escape key
  // ---------------------------
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeDropdown();
    closeNav();
  });

  // ---------------------------
  // If switching to desktop layout while nav is open, close it
  // ---------------------------
  window.addEventListener("resize", () => {
    // This breakpoint can match whatever you pick in CSS
    if (window.innerWidth >= 900) {
      closeNav();
      closeDropdown();
    }
  });
})();
