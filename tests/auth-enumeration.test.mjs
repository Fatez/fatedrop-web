import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const registerSource = await readFile(new URL("../app/api/auth/register/route.ts", import.meta.url), "utf8");

test("registration does not expose storage conflict details", () => {
  assert.match(registerSource, /instanceof AccountConflictError/);
  assert.match(registerSource, /An account could not be created with those details\./);
  assert.doesNotMatch(registerSource, /AccountConflictError\)[\s\S]{0,180}error\.message/);
});
