import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");

test("public shell preserves skip navigation and a main landmark", () => {
  const shell = read("components/page-shell.tsx");
  assert.ok(shell.includes('className="skip-link" href="#main"'));
  assert.ok(shell.includes("Skip to content"));
  assert.ok(shell.includes('<main id="main">'));
});

test("root layout imports a site-wide visible keyboard focus safety net", () => {
  const layout = read("app/layout.tsx");
  const accessibility = read("app/accessibility.css");
  assert.ok(layout.includes('import "./accessibility.css"'));
  assert.ok(accessibility.includes(":focus-visible"));
  for (const control of ["a", "button", "input", "select", "textarea", "[tabindex]"]) {
    assert.ok(accessibility.includes(control), `${control} missing from focus safety net`);
  }
  assert.ok(accessibility.includes("outline: 2px solid var(--cyan)"));
  assert.ok(accessibility.includes("outline-offset: 3px"));
});

test("primary navigation uses semantic expandable buttons", () => {
  const nav = read("components/nav.tsx");
  assert.ok(nav.includes('type="button"'));
  assert.ok(nav.includes('aria-haspopup="menu"'));
  assert.ok(nav.includes("aria-expanded={merchOpen}"));
  assert.ok(nav.includes("aria-expanded={accountOpen}"));
  assert.ok(nav.includes('aria-label={open ? "Close menu" : "Open menu"}'));
  assert.ok(nav.includes("aria-expanded={open}"));
});

test("companion state controls remain keyboard buttons with reduced-motion support", () => {
  const selector = read("components/companion-selector.tsx");
  const webgl = read("components/companion-webgl-model.tsx");
  assert.ok(selector.includes('type="button"'));
  assert.ok(selector.includes("aria-pressed={reaction === item.id}"));
  assert.ok(selector.includes("aria-pressed={active}"));
  assert.ok(webgl.includes('window.matchMedia("(prefers-reduced-motion: reduce)").matches'));
  assert.ok(webgl.includes("if (reducedMotion) frame(started)"));
});
