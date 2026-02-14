const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const { app } = require('../src/app');

const cases = [
  ['get', '/api/health'],
  ['get', '/api/docs'],
  ['get', '/api/docs.json'],
  ['post', '/api/auth/register', {}],
  ['post', '/api/auth/verify-otp', {}],
  ['post', '/api/auth/login', {}],
  ['post', '/api/auth/verify-login-otp', {}],
  ['post', '/api/auth/forgot-password', {}],
  ['post', '/api/auth/reset-password', {}],
  ['post', '/api/auth/change-password', {}],
  ['post', '/api/auth/request-delete-account', {}],
  ['post', '/api/auth/confirm-delete-account', {}],
  ['get', '/api/user/profile'],
  ['put', '/api/user/profile', {}],
  ['get', '/api/user/wishlist'],
  ['post', '/api/user/wishlist/1', {}],
  ['delete', '/api/user/wishlist/1'],
  ['get', '/api/user/referral'],
  ['get', '/api/products'],
  ['get', '/api/products/1'],
  ['post', '/api/products/1/rate', {}],
  ['post', '/api/products/1/comment', {}],
  ['get', '/api/cart'],
  ['post', '/api/cart', {}],
  ['put', '/api/cart/1', {}],
  ['delete', '/api/cart/1'],
  ['post', '/api/orders/checkout', {}],
  ['get', '/api/orders'],
  ['get', '/api/orders/1/status'],
  ['get', '/api/orders/1'],
  ['post', '/api/contact', {}],
  ['post', '/api/coupons/validate', {}],
  ['post', '/api/payments/webhook', {}],
  ['post', '/api/admin/admin-users', {}],
  ['post', '/api/admin/categories', {}],
  ['put', '/api/admin/categories/1', {}],
  ['delete', '/api/admin/categories/1'],
  ['post', '/api/admin/products', {}],
  ['put', '/api/admin/products/1', {}],
  ['delete', '/api/admin/products/1'],
  ['post', '/api/admin/flash-sales', {}],
  ['get', '/api/admin/flash-sales'],
  ['put', '/api/admin/flash-sales/1', {}],
  ['delete', '/api/admin/flash-sales/1'],
  ['post', '/api/admin/coupons', {}],
  ['get', '/api/admin/coupons'],
  ['put', '/api/admin/coupons/1', {}],
  ['delete', '/api/admin/coupons/1'],
  ['get', '/api/admin/contact-messages'],
  ['post', '/api/admin/contact-messages/1/reply', {}],
  ['get', '/api/admin/users'],
  ['get', '/api/admin/orders'],
  ['patch', '/api/admin/orders/1/status', {}],
  ['post', '/api/support/conversations', {}],
  ['get', '/api/support/conversations'],
  ['get', '/api/support/unread-count'],
  ['get', '/api/support/conversations/1/messages'],
  ['post', '/api/support/conversations/1/messages', {}],
  ['patch', '/api/support/conversations/1/read', {}],
  ['patch', '/api/support/conversations/1/status', {}],
  ['get', '/api/support/attachments/1/signed-url'],
  ['get', '/api/support/attachments/1/download'],
];

test('all declared routes are reachable (not 404/405)', async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  for (const [method, url, body] of cases) {
    const response = await fetch(`http://127.0.0.1:${port}${url}`, {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    assert.notEqual(response.status, 404, `${method.toUpperCase()} ${url} returned 404`);
    assert.notEqual(response.status, 405, `${method.toUpperCase()} ${url} returned 405`);
  }

  await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
});
