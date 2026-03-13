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
      if (statusEl) {
        statusEl.hidden = false;
        statusEl.textContent = "Please complete all required fields.";
      }
      return;
    }

    const captchaResponse = form.querySelector('textarea[name="h-captcha-response"]')?.value ||
      form.querySelector('input[name="h-captcha-response"]')?.value ||
      "";

    if (!captchaResponse) {
      if (statusEl) {
        statusEl.hidden = false;
        statusEl.textContent = "Please complete the captcha.";
      }
      return;
    }

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dateString = `${yyyy}-${mm}-${dd}`;

    subjectField.value = `website form - ${name} - ${dateString} - ${subjectChoice}`;

    bodyField.value = [
      `Name - ${name}`,
      `Email - ${email}`,
      `Phone - ${phone || "Not provided"}`,
      `Subject - ${subjectChoice}`,
      `Message - ${message}`
    ].join("\r\n");

    const formData = new FormData();
    formData.append("from", "dylan.billson@galassify.co.uk");
    formData.append("subject", subjectField.value);
    formData.append("body", bodyField.value);
    formData.append("h-captcha-response", captchaResponse);

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    if (statusEl) {
      statusEl.hidden = true;
      statusEl.textContent = "";
    }

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        let errorText = `Something went wrong (${response.status}). Please try again.`;
        try {
          const body = await response.text();
          if (body) errorText = `Something went wrong. ${body}`;
        } catch (_) {}
        throw new Error(errorText);
      }

      form.reset();

      if (window.hcaptcha && typeof window.hcaptcha.reset === "function") {
        window.hcaptcha.reset();
      }

      openPopup();
    } catch (error) {
      if (statusEl) {
        statusEl.hidden = false;
        statusEl.textContent = error.message || "Something went wrong. Please try again.";
      }
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send message";
    }
  });
});