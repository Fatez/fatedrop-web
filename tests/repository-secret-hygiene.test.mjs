import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const ignoredDirs = new Set([".git", ".next", ".open-next", "node_modules"]);
const textExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".md", ".yml", ".yaml", ".toml", ".txt", ".example"]);

function textFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (ignoredDirs.has(entry.name)) return [];
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return textFiles(full);
    const ext = path.extname(entry.name);
    if (entry.name === ".env.example" || textExtensions.has(ext)) return [full];
    return [];
  });
}

const forbidden = [
  { name: "Stripe live secret key", pattern: /\bsk_live_[A-Za-z0-9]{16,}\b/g },
  { name: "Stripe webhook secret", pattern: /\bwhsec_[A-Za-z0-9]{16,}\b/g },
  { name: "GitHub classic token", pattern: /\bghp_[A-Za-z0-9]{20,}\b/g },
  { name: "GitHub fine-grained token", pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g },
  { name: "AWS access key", pattern: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: "Discord-style bot token", pattern: /\b(?:M|N)[A-Za-z0-9_-]{23,}\.[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{20,}\b/g },
];

test("current repository text tree contains no obvious production credentials", () => {
  const hits = [];
  for (const file of textFiles(root)) {
    const relative = path.relative(root, file).split(path.sep).join("/");
    const source = fs.readFileSync(file, "utf8");
    for (const rule of forbidden) {
      rule.pattern.lastIndex = 0;
      if (rule.pattern.test(source)) hits.push(`${rule.name}: ${relative}`);
    }
  }
  assert.deepEqual(hits, [], `potential committed credentials detected:\n${hits.join("\n")}`);
});
