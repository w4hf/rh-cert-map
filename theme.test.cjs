const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { runInNewContext } = require("node:vm");
const source = readFileSync(`${__dirname}/theme.js`, "utf8");
const key = "redhat-cert-map-appearance";

function boot({ saved, legacy, system = {}, blocked = false } = {}) {
  const storage = new Map();
  if (saved !== undefined) storage.set(key, typeof saved === "string" ? saved : JSON.stringify(saved));
  if (legacy) storage.set("redhat-cert-map-theme", legacy);
  const classes = new Set();
  const attributes = {};
  const media = new Map();
  const listeners = {};
  const root = {
    classList: { toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); } },
    setAttribute(name, value) { attributes[name] = value; },
    style: {},
  };
  runInNewContext(source, {
    document: {
      documentElement: root,
      querySelectorAll: () => [],
      getElementById: () => null,
      addEventListener() {},
    },
    localStorage: {
      getItem(name) {
        if (blocked) throw new Error("Storage blocked");
        return storage.get(name) ?? null;
      },
      setItem() { assert.fail("Initial load must not persist resolved system settings"); },
    },
    window: {
      matchMedia(query) {
        const entry = {
          matches: !!system[query],
          addEventListener(type, callback) { this.change = callback; },
        };
        media.set(query, entry);
        return entry;
      },
      addEventListener(type, callback) { listeners[type] = callback; },
    },
  });
  return {
    classes, attributes, root,
    change(query, matches) {
      const entry = media.get(query);
      entry.matches = matches;
      entry.change();
    },
    sync(saved) {
      storage.set(key, JSON.stringify(saved));
      listeners.storage({ key });
    },
  };
}

test("new visitors follow system color changes without freezing the resolved value", () => {
  const app = boot();
  assert.equal(app.attributes["data-theme"], "light");
  app.change("(prefers-color-scheme: dark)", true);
  assert.equal(app.attributes["data-theme"], "dark");
  assert.equal(app.root.style.colorScheme, "dark");
  app.change("(prefers-color-scheme: dark)", false);
  assert.equal(app.attributes["data-theme"], "light");
});

test("saved themes combine independently with each color scheme and contrast mode", () => {
  for (const theme of ["default", "felt"]) {
    for (const colorScheme of ["light", "dark", "system"]) {
      for (const contrast of ["default", "high-contrast", "glass", "system"]) {
        const app = boot({ saved: { theme, colorScheme, contrast } });
        assert.equal(app.classes.has("pf-v6-theme-felt"), theme === "felt");
        assert.equal(app.classes.has("pf-v6-theme-dark"), colorScheme === "dark");
        assert.equal(app.classes.has("pf-v6-theme-high-contrast"), contrast === "high-contrast");
        assert.equal(app.classes.has("pf-v6-theme-glass"), contrast === "glass");
        app.change("(prefers-color-scheme: dark)", true);
        assert.equal(app.classes.has("pf-v6-theme-dark"), colorScheme !== "light");
      }
    }
  }
});

test("legacy explicit color schemes survive migration and new preferences take precedence", () => {
  for (const legacy of ["light", "dark"]) {
    const app = boot({ legacy });
    app.change("(prefers-color-scheme: dark)", legacy === "light");
    assert.equal(app.attributes["data-theme"], legacy);
  }
  assert.equal(boot({ legacy: "dark", saved: { colorScheme: "light" } }).attributes["data-theme"], "light");
});

test("invalid or inaccessible storage falls back to system preferences", () => {
  for (const input of [{ saved: "{" }, { saved: "null" }, { saved: { theme: "bogus", contrast: "bogus" } }, { blocked: true }]) {
    const app = boot(input);
    app.change("(prefers-color-scheme: dark)", true);
    assert.deepEqual([...app.classes], ["pf-v6-theme-dark"]);
  }
});

test("accessibility changes suppress glass and restore it when the override clears", () => {
  for (const query of ["(prefers-contrast: more)", "(forced-colors: active)", "(prefers-reduced-transparency: reduce)"]) {
    const app = boot({ saved: { contrast: "glass" } });
    app.change(query, true);
    assert.equal(app.classes.has("pf-v6-theme-glass"), false);
    assert.equal(app.classes.has("pf-v6-theme-high-contrast"), !query.includes("transparency"));
    app.change(query, false);
    assert.equal(app.classes.has("pf-v6-theme-glass"), true);
    assert.equal(app.classes.has("pf-v6-theme-high-contrast"), false);
  }
});

test("cross-tab changes remove previous theme classes and keep contrast modes exclusive", () => {
  const app = boot({ saved: { theme: "felt", colorScheme: "dark", contrast: "glass" } });
  app.sync({ theme: "default", colorScheme: "light", contrast: "high-contrast" });
  assert.deepEqual([...app.classes], ["pf-v6-theme-high-contrast"]);
  app.sync({ theme: "felt", colorScheme: "system", contrast: "glass" });
  assert.deepEqual([...app.classes].sort(), ["pf-v6-theme-felt", "pf-v6-theme-glass"]);
});
