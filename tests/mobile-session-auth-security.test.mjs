import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../app/api/mobile/session/route.ts", import.meta.url), "utf8");

test("mobile login performs the same password verification path for absent accounts", () => {
  assert.match(source, /verifyLoginPassword\(password, account\?\.passwordHash\)/);
  assert.doesNotMatch(source, /account \? await verifyPassword/);
});

test("mobile login bounds password input before the password KDF without changing bearer session issuance", () => {
  assert.match(source, /payload\.password\.length <= 200/);
  assert.match(source, /startApiSession\(account\.id\)/);
  assert.match(source, /sessionToken: session\.token/);
  assert.match(source, /Email or password is incorrect\./);
});
