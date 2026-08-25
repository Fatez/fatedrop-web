import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("collector page explains the Fate Network as the umbrella around existing tools", async () => {
  const page = await source("app/collectors/page.tsx");
  assert.ok(page.includes("Fate Network · For collectors"));
  assert.ok(page.includes("One network. More places to find what you collect."));
  assert.ok(page.includes("A connected view of the market — not another shop."));
  assert.ok(page.includes("Search tells you what FateDrop knows. FateFind helps decide what is strongest value now. FateMatch handles the waiting."));
  assert.ok(page.includes("A smaller retailer can still be the right answer."));
  assert.ok(page.includes("The best answer cannot be bought."));
  assert.ok(page.includes("payment cannot buy stronger trust, a better RRP verdict, alert priority or organic FateFind placement"));
  assert.ok(page.includes("Whisper → Echo → Manifested → Vanished"));
});

test("retailer page explains the same Fate Network from the supply side", async () => {
  const page = await source("app/businesses/page.tsx");
  assert.ok(page.includes("Fate Network · For retailers"));
  assert.ok(page.includes("Put your stock where collectors are already looking."));
  assert.ok(page.includes("Your catalogue becomes part of a connected discovery network."));
  assert.ok(page.includes("Your products. Your prices. Your website. Your checkout."));
  assert.ok(page.includes("Good stock should not be invisible because your audience is smaller."));
  assert.ok(page.includes("The retailer dashboard should show what FateDrop actually did for you."));
  assert.ok(page.includes("Retailers pay for tools — not for a better answer."));
  assert.ok(page.includes("It cannot buy stronger verification, a better RRP verdict, alert priority or organic FateFind ranking."));
});

test("public Fate Network story does not overclaim sales or singles coverage", async () => {
  const [collectors, businesses] = await Promise.all([
    source("app/collectors/page.tsx"),
    source("app/businesses/page.tsx"),
  ]);
  assert.ok(businesses.includes("does not claim it generated my sales" ) || businesses.includes("Does FateDrop claim it generated my sales?"));
  assert.ok(businesses.includes("Verified revenue attribution would only be shown later"));
  assert.ok(businesses.includes("Where a retailer can expose reliable singles catalogue, identity, condition and availability data"));
  assert.ok(collectors.includes("when reliable product and stock data is available"));
  assert.equal(collectors.includes("FateDrop sells your products"), false);
  assert.equal(businesses.includes("FateDrop guarantees sales"), false);
});
