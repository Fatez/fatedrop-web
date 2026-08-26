import test from 'node:test';
import assert from 'node:assert/strict';

import { fateTraderCloudPath } from '../lib/fate-trader-web.ts';

test('Fate Trader Finder is forwarded only to the canonical Cloud route', () => {
  assert.equal(fateTraderCloudPath(['finder']), '/v1/trader/finder');
  assert.equal(fateTraderCloudPath(['finder', 'users']), null);
  assert.equal(fateTraderCloudPath(['finder', '..']), null);
});
