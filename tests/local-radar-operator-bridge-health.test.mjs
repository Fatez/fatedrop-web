import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const route = await readFile(new URL('../app/api/dashboard/local-radar-operator-alert/route.ts', import.meta.url), 'utf8');

test('operator bridge exposes an authenticated non-mutating readiness probe', () => {
  assert.match(route, /export async function GET\(request: Request\)/);
  assert.match(route, /if \(!authorized\(request\)\)/);
  assert.match(route, /readPushProductionHealth\(\)/);
  assert.match(route, /status: health\.ok \? 204 : 503/);
  assert.match(route, /"cache-control": "no-store"/);
});

test('readiness probe cannot enqueue or fabricate an operator alert', () => {
  const start = route.indexOf('export async function GET');
  const end = route.indexOf('export async function POST');
  const getHandler = route.slice(start, end);
  assert.doesNotMatch(getHandler, /dispatchLocalRadarOperatorPush/);
  assert.doesNotMatch(getHandler, /fatedrop_notification_outbox/);
  assert.doesNotMatch(getHandler, /eventId/);
  assert.doesNotMatch(getHandler, /productTitle/);
  assert.doesNotMatch(getHandler, /retailerId/);
});

test('real operator POST still uses the canonical manual push dispatcher', () => {
  assert.match(route, /export async function POST\(request: Request\)/);
  assert.match(route, /dispatchLocalRadarOperatorPush\(event\)/);
  assert.match(route, /eventId !== `local-radar-operator:\$\{operatorIssue\}`/);
});
