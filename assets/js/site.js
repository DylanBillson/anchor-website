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
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".listmonk-form");
  if (!form) return;

  const emailInput = form.querySelector('input[name="email"]');
  const nameInput = form.querySelector('input[name="name"]');

  form.addEventListener("submit", function () {
    if (!emailInput || !nameInput) return;

    const email = emailInput.value.trim();
    if (!email.includes("@")) return;

    let namePart = email.split("@")[0];

    // Optional: make it slightly nicer (remove dots/underscores, capitalise first letter)
    namePart = namePart.replace(/[._-]+/g, " ");
    namePart = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    nameInput.value = namePart;
  });
});
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("anchor-contact-form");
  if (!form) return;

  const submitButton = document.getElementById("contact-submit-button");
  const statusEl = document.getElementById("contact-form-status");
  const popup = document.getElementById("contact-popup");
  const capWidget = document.getElementById("anchor-contact-cap");

  const mailformEndpoint =
    form.dataset.mailformEndpoint ||
    form.getAttribute("action") ||
    "";

  const capEndpoint =
    form.dataset.capEndpoint ||
    "https://captcha.galassify.co.uk/355f619e41/";

  if (capWidget && capWidget.getAttribute("data-cap-api-endpoint") !== capEndpoint) {
    capWidget.setAttribute("data-cap-api-endpoint", capEndpoint);
  }

  const openPopup = () => {
    if (!popup) return;
    popup.hidden = false;
    document.body.classList.add("has-contact-popup");
  };

  const closePopup = () => {
    if (!popup) return;
    popup.hidden = true;
    document.body.classList.remove("has-contact-popup");
  };

  const showStatus = (message) => {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.textContent = message;
  };

  const clearStatus = () => {
    if (!statusEl) return;
    statusEl.hidden = true;
    statusEl.textContent = "";
  };

  const getCapToken = () => {
    const tokenField = form.querySelector('input[name="cap-token"], textarea[name="cap-token"]');
    return tokenField ? tokenField.value.trim() : "";
  };

  popup?.addEventListener("click", function (event) {
    if (event.target.matches("[data-contact-popup-close]")) {
      closePopup();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && popup && !popup.hidden) {
      closePopup();
    }
  });

  capWidget?.addEventListener("solve", function () {
    clearStatus();
  });

  capWidget?.addEventListener("error", function () {
    showStatus("Captcha error. Please try again.");
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("contact-name")?.value.trim() || "";
    const email = document.getElementById("contact-email")?.value.trim() || "";
    const phone = document.getElementById("contact-phone")?.value.trim() || "";
    const subjectChoice = document.getElementById("contact-subject-select")?.value.trim() || "";
    const message = document.getElementById("contact-message")?.value.trim() || "";
    const subjectField = document.getElementById("contact-mail-subject");
    const bodyField = document.getElementById("contact-mail-body");

    if (!name || !email || !subjectChoice || !message || !subjectField || !bodyField) {
      showStatus("Please complete all required fields.");
      return;
    }

    const capToken = getCapToken();
    if (!capToken) {
      showStatus("Please complete the captcha.");
      return;
    }

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dateString = `${yyyy}-${mm}-${dd}`;

    subjectField.value = `${name} - ${dateString} - ${subjectChoice}`;

    bodyField.value = [
      `Name - ${name}`,
      `Email - ${email}`,
      `Phone - ${phone || "Not provided"}`,
      `Subject - ${subjectChoice}`,
      "",
      "Message:",
      message
    ].join("\r\n");

    const formData = new FormData();
    formData.append("from", email);
    formData.append("subject", subjectField.value);
    formData.append("body", bodyField.value);
    formData.append("cap-token", capToken);

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    clearStatus();

    try {
      const response = await fetch(mailformEndpoint, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        let errorText = `Something went wrong (${response.status}). Please try again.`;

        try {
          const responseText = await response.text();
          if (responseText) {
            errorText = `Something went wrong. ${responseText}`;
          }
        } catch (_) {}

        throw new Error(errorText);
      }

      form.reset();
      clearStatus();
      openPopup();
    } catch (error) {
      showStatus(error.message || "Something went wrong. Please try again.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send message";
    }
  });
});
document.addEventListener("DOMContentLoaded", function () {
  const cfg = window.AnchorAnalyticsConfig || {};
  const storageKey = cfg.storageKey || "anchor_cookie_consent";

  const banner = document.getElementById("cookie-banner");
  const statusEl = document.getElementById("analytics-status");
  const toggleEl = document.getElementById("analytics-toggle");

  const getConsent = () => {
    try {
      return localStorage.getItem(storageKey);
    } catch (e) {
      return null;
    }
  };

  const updateConsentUI = (value) => {
    const accepted = value === "accepted";

    if (banner) {
      banner.hidden = value === "accepted" || value === "rejected";
    }

    if (toggleEl) {
      toggleEl.setAttribute("aria-checked", accepted ? "true" : "false");
      toggleEl.classList.toggle("is-on", accepted);
    }

    if (statusEl) {
      statusEl.textContent = accepted
        ? "Analytics are enabled."
        : "Analytics are disabled.";
    }
  };

  const setConsent = (value) => {
    try {
      localStorage.setItem(storageKey, value);
    } catch (e) {}

    updateConsentUI(value);

    if (value === "accepted" && typeof window.loadAnchorMatomo === "function") {
      window.loadAnchorMatomo();
    }
  };

  document.querySelectorAll("[data-cookie-accept]").forEach((button) => {
    button.addEventListener("click", function () {
      setConsent("accepted");
    });
  });

  document.querySelectorAll("[data-cookie-reject]").forEach((button) => {
    button.addEventListener("click", function () {
      setConsent("rejected");
    });
  });

  if (toggleEl) {
    const handleToggle = () => {
      const current = getConsent();
      const next = current === "accepted" ? "rejected" : "accepted";
      setConsent(next);
    };

    toggleEl.addEventListener("click", handleToggle);

    toggleEl.addEventListener("keydown", function (event) {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        handleToggle();
      }
    });
  }

  const currentConsent = getConsent();
  updateConsentUI(currentConsent);

  if (currentConsent === "accepted" && typeof window.loadAnchorMatomo === "function") {
    window.loadAnchorMatomo();
  }
});