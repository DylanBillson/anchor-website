(() => {
  const root = document.querySelector("[data-menus-api]");
  if (!root) return;

  const apiUrl = root.dataset.menusApiUrl;
  const loadingEl = document.getElementById("menus-loading");
  const errorEl = document.getElementById("menus-error");
  const emptyEl = document.getElementById("menus-empty");
  const listEl = document.getElementById("menus-list");

  const escapeHtml = (value) => {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  const normaliseText = (value) => {
    return String(value || "").replace(/\r\n/g, "\n").replace(/\n/g, "<br>");
  };

  const formatPrice = (price) => {
    if (!price) return "";
    return String(price).replace(/\.0$/, "");
  };

  const sortByOrder = (a, b) => {
    return (a.sort_order || 0) - (b.sort_order || 0);
  };

  const renderItem = (item, mode = "detailed") => {
    const description = item.description
      ? `<p class="menu__item-desc">${normaliseText(escapeHtml(item.description))}</p>`
      : "";

    const tags = item.special_tags
      ? `<p class="menu__item-meta"><span class="menu__item-meta-group"><strong>Tags:</strong> <span class="tag">${escapeHtml(item.special_tags)}</span></span></p>`
      : "";

    const price = item.price
      ? `<span class="menu__item-price">${escapeHtml(formatPrice(item.price))}</span>`
      : "";

    return `
      <li class="menu__item menu__item--${escapeHtml(mode || "detailed")}">
        <div class="menu__item-top">
          <span class="menu__item-name">${escapeHtml(item.name)}</span>
          ${price}
        </div>
        ${mode !== "compact" ? description : ""}
        ${tags}
      </li>
    `;
  };

  const renderStandardSection = (block) => {
    const items = Array.isArray(block.items) ? block.items.slice().sort(sortByOrder) : [];

    return `
      <section class="menu__category">
        <h4 class="menu__category-title">${escapeHtml(block.title || "Menu section")}</h4>
        ${
          block.description
            ? `<p class="menu__category-desc">${normaliseText(escapeHtml(block.description))}</p>`
            : ""
        }
        <ul class="menu__items menu__items--cols-${escapeHtml(block.column_count || 1)}">
          ${items.map((item) => renderItem(item, block.display_mode)).join("")}
        </ul>
      </section>
    `;
  };

  const renderDuoSection = (block) => {
    const items = Array.isArray(block.items) ? block.items.slice().sort(sortByOrder) : [];
    const leftItems = items.filter((item) => item.item_group === "left");
    const rightItems = items.filter((item) => item.item_group === "right");

    return `
      <section class="menu__category menu__category--duo">
        <div class="menu-duo">
          <div class="menu-duo__col">
            <h4 class="menu__category-title">${escapeHtml(block.left_title || "Menu")}</h4>
            ${
              block.left_description
                ? `<p class="menu__category-desc">${normaliseText(escapeHtml(block.left_description))}</p>`
                : ""
            }
            <ul class="menu__items">
              ${leftItems.map((item) => renderItem(item, block.left_display_mode || "compact")).join("")}
            </ul>
          </div>

          <div class="menu-duo__col">
            <h4 class="menu__category-title">${escapeHtml(block.right_title || "Menu")}</h4>
            ${
              block.right_description
                ? `<p class="menu__category-desc">${normaliseText(escapeHtml(block.right_description))}</p>`
                : ""
            }
            <ul class="menu__items">
              ${rightItems.map((item) => renderItem(item, block.right_display_mode || "detailed")).join("")}
            </ul>
          </div>
        </div>
      </section>
    `;
  };

  const renderBlock = (block) => {
    if (!block || block.block_type === "page_break") return "";

    if (block.block_type === "duo_section") {
      return renderDuoSection(block);
    }

    return renderStandardSection(block);
  };

  const renderMenu = (menu) => {
    const title = menu.public_title || menu.internal_title || "Menu";
    const blocks = Array.isArray(menu.blocks) ? menu.blocks.slice().sort(sortByOrder) : [];

    return `
      <details class="menu-details">
        <summary class="menu-details__summary">
          <span class="menu-details__title">${escapeHtml(title)}</span>
        </summary>

        <section class="menu">
          ${blocks.map(renderBlock).join("")}
          <p class="menu__disclaimer">
            <em>Please let us know about any allergies or dietary requirements before ordering.</em>
          </p>
        </section>
      </details>
    `;
  };

  const setError = () => {
    if (loadingEl) loadingEl.hidden = true;
    if (errorEl) errorEl.hidden = false;
    if (emptyEl) emptyEl.hidden = true;
    if (listEl) listEl.hidden = true;
  };

  const setEmpty = () => {
    if (loadingEl) loadingEl.hidden = true;
    if (errorEl) errorEl.hidden = true;
    if (emptyEl) emptyEl.hidden = false;
    if (listEl) listEl.hidden = true;
  };

  const setLoaded = () => {
    if (loadingEl) loadingEl.hidden = true;
    if (errorEl) errorEl.hidden = true;
    if (emptyEl) emptyEl.hidden = true;
    if (listEl) listEl.hidden = false;
  };

  const init = async () => {
    if (!apiUrl) {
      setError();
      return;
    }

    try {
      const response = await fetch(apiUrl, { method: "GET" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const menus = Array.isArray(data.menus)
        ? data.menus.filter((menu) => menu.is_active === true || menu.status === "active")
        : [];

      if (!menus.length) {
        setEmpty();
        return;
      }

      const sortedMenus = menus.slice().sort((a, b) => {
        return String(a.category || "").localeCompare(String(b.category || ""), "en");
      });

      listEl.innerHTML = sortedMenus.map(renderMenu).join("");
      setLoaded();
    } catch (error) {
      setError();
    }
  };

  init();
})();