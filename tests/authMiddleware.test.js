import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { ensureAuthenticated } from '../middleware/authMiddleware.js';

test('authenticated users continue to the protected route', () => {
  const next = mock.fn();
  const res = { redirect: mock.fn() };
  ensureAuthenticated({ isAuthenticated: () => true }, res, next);
  assert.equal(next.mock.callCount(), 1);
  assert.equal(res.redirect.mock.callCount(), 0);
});

test('unauthenticated users are redirected to the home page', () => {
  const next = mock.fn();
  const res = { redirect: mock.fn() };
  ensureAuthenticated({ isAuthenticated: () => false }, res, next);
  assert.deepEqual(res.redirect.mock.calls[0].arguments, ['/']);
  assert.equal(next.mock.callCount(), 0);
});
