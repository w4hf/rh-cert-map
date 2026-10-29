(function () {
  "use strict";

  const KEY = "redhat-cert-map-appearance";
  const LEGACY_KEY = "redhat-cert-map-theme";
  const options = {
    theme: ["default", "felt"],
    colorScheme: ["system", "light", "dark"],
    contrast: ["system", "default", "high-contrast", "glass"],
  };
  const root = document.documentElement;
  const media = {
    dark: window.matchMedia("(prefers-color-scheme: dark)"),
    highContrast: window.matchMedia("(prefers-contrast: more)"),
    forcedColors: window.matchMedia("(forced-colors: active)"),
    reducedTransparency: window.matchMedia("(prefers-reduced-transparency: reduce)"),
  };

  function loadPreferences() {
    let saved;
    try {
      const stored = localStorage.getItem(KEY);
      saved = stored ? JSON.parse(stored) : { colorScheme: localStorage.getItem(LEGACY_KEY) };
    } catch {
      // Keep the menu usable when storage is blocked or contains invalid JSON.
    }
    return Object.fromEntries(Object.entries(options).map(([name, values]) => [
      name, values.includes(saved?.[name]) ? saved[name] : values[0],
    ]));
  }

  let preferences = loadPreferences();

  function applyPreferences() {
    const dark = preferences.colorScheme === "dark" ||
      (preferences.colorScheme === "system" && media.dark.matches);
    // Accessibility preferences take precedence; glass and high contrast must never coexist.
    const highContrast = preferences.contrast === "high-contrast" ||
      media.highContrast.matches || media.forcedColors.matches;
    const glass = preferences.contrast === "glass" && !highContrast &&
      !media.reducedTransparency.matches;

    root.classList.toggle("pf-v6-theme-felt", preferences.theme === "felt");
    root.classList.toggle("pf-v6-theme-dark", dark);
    root.classList.toggle("pf-v6-theme-high-contrast", highContrast);
    root.classList.toggle("pf-v6-theme-glass", glass);
    root.setAttribute("data-theme", dark ? "dark" : "light");
    root.style.colorScheme = dark ? "dark" : "light";

    document.querySelectorAll("[data-appearance]").forEach((item) => {
      const selected = preferences[item.dataset.appearance] === item.dataset.value;
      item.setAttribute("aria-checked", String(selected));
      item.classList.toggle("pf-m-selected", selected);
    });
    const note = document.getElementById("theme-system-note");
    if (note) note.hidden = preferences.contrast !== "glass" || glass;
  }

  // Run before the stylesheets load to avoid flashing the wrong theme on reload.
  applyPreferences();
  Object.values(media).forEach((query) => query.addEventListener("change", applyPreferences));
  window.addEventListener("storage", (event) => {
    if (event.key === KEY || event.key === LEGACY_KEY || event.key === null) {
      preferences = loadPreferences();
      applyPreferences();
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    const wrap = document.getElementById("theme-menu-wrap");
    const toggle = document.getElementById("theme-toggle");
    const menu = document.getElementById("theme-menu");
    const items = Array.from(menu.querySelectorAll("[role=menuitemradio]"));

    function setOpen(open, index = 0) {
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      if (open) items[index].focus();
    }

    toggle.addEventListener("click", () => setOpen(menu.hidden));
    toggle.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setOpen(true, event.key === "ArrowUp" ? items.length - 1 : 0);
      }
    });
    menu.addEventListener("click", (event) => {
      const item = event.target.closest("[data-appearance]");
      if (!item) return;
      preferences[item.dataset.appearance] = item.dataset.value;
      try {
        localStorage.setItem(KEY, JSON.stringify(preferences));
      } catch {
        // Selections still apply for this page when storage is unavailable.
      }
      applyPreferences();
    });
    menu.addEventListener("keydown", (event) => {
      const index = items.indexOf(document.activeElement);
      let next;
      if (event.key === "ArrowDown") next = (index + 1) % items.length;
      if (event.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = items.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        items[next].focus();
      }
      if (event.key.length === 1 && /\S/.test(event.key)) {
        const ordered = items.slice(index + 1).concat(items.slice(0, index + 1));
        const match = ordered.find((item) => item.textContent.trim().toLowerCase().startsWith(event.key.toLowerCase()));
        if (match) {
          event.preventDefault();
          match.focus();
        }
      }
      if (event.key === "Tab") {
        // Menu items use arrow navigation; Tab exits through the trigger.
        setOpen(false);
        toggle.focus();
      }
    });
    wrap.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) {
        event.preventDefault();
        setOpen(false);
        toggle.focus();
      }
    });
    wrap.addEventListener("focusout", (event) => {
      if (!wrap.contains(event.relatedTarget)) setOpen(false);
    });
    document.addEventListener("click", (event) => {
      if (!wrap.contains(event.target)) setOpen(false);
    });
    // The existing links trigger stops click propagation.
    document.getElementById("links-toggle").addEventListener("click", () => setOpen(false));
    applyPreferences();
  });
})();
