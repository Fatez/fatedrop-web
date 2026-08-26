import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const authSource = await readFile(new URL("../lib/auth.ts", import.meta.url), "utf8");
const loginSource = await readFile(new URL("../app/api/auth/login/route.ts", import.meta.url), "utf8");

test("login verification always performs scrypt work even when an account is absent", () => {
  assert.match(authSource, /const DUMMY_PASSWORD_HASH = "scrypt\$/);
  assert.match(authSource, /verifyLoginPassword\(password: string, stored: string \| null \| undefined\)/);
  assert.match(authSource, /verifyPassword\(password, stored \|\| DUMMY_PASSWORD_HASH\)/);
  assert.match(loginSource, /await verifyLoginPassword\(password, account\?\.passwordHash\)/);
  assert.doesNotMatch(loginSource, /account \? await verifyPassword/);
});

test("login bounds password input before running the password KDF", () => {
  assert.match(loginSource, /payload\.password\.length <= 200/);
  assert.match(loginSource, /Email or password is incorrect\./);
});
