const errorSchema = {
  type: 'object',
  properties: { error: { type: 'string' } },
};

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });

const jsonContent = (schema, example) => ({
  'application/json': {
    schema,
    ...(example ? { example } : {}),
  },
});

const publicResponses = (okExample, okSchema = ref('ApiObject')) => ({
  200: { description: 'Success', content: jsonContent(okSchema, okExample || { message: 'OK' }) },
  400: { description: 'Bad request', content: jsonContent(errorSchema, { error: 'Invalid request payload' }) },
  500: { description: 'Server error', content: jsonContent(errorSchema, { error: 'Something went wrong' }) },
});

const authResponses = (okExample, okSchema = ref('ApiObject')) => ({
  200: { description: 'Success', content: jsonContent(okSchema, okExample || { message: 'OK' }) },
  400: { description: 'Bad request', content: jsonContent(errorSchema, { error: 'Invalid request payload' }) },
  401: { description: 'Unauthorized', content: jsonContent(errorSchema, { error: 'Please authenticate' }) },
  403: { description: 'Forbidden', content: jsonContent(errorSchema, { error: 'Access denied' }) },
  500: { description: 'Server error', content: jsonContent(errorSchema, { error: 'Something went wrong' }) },
});

const pathIdParam = { in: 'path', name: 'id', required: true, schema: { type: 'integer' } };

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Glossy Store API',
    version: '2.0.5',
    description: 'API docs with request and response examples for all endpoints.',
  },
  servers: [{ url: '/api', description: 'API Base' }],
  tags: [
    { name: 'Health' }, { name: 'Auth' }, { name: 'Users' }, { name: 'Products' }, { name: 'Cart' },
    { name: 'Orders' }, { name: 'Support' }, { name: 'Coupons' }, { name: 'Contact' }, { name: 'Payments' }, { name: 'Admin' },
  ],
  'x-tagGroups': [
    { name: 'Core', tags: ['Health', 'Auth', 'Users'] },
    { name: 'Commerce', tags: ['Products', 'Cart', 'Orders', 'Coupons'] },
    { name: 'Support', tags: ['Support', 'Contact'] },
    { name: 'Operations', tags: ['Payments', 'Admin'] },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      ApiObject: { type: 'object', additionalProperties: true },
      Error: errorSchema,
      MessageResponse: {
        type: 'object',
        properties: { message: { type: 'string' } },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          service: { type: 'string' },
        },
      },
      AuthUser: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string' },
          is_super_admin: { type: 'boolean' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: ref('AuthUser'),
        },
      },
      ProductListResponse: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          page: { type: 'integer' },
          pages: { type: 'integer' },
          products: { type: 'array', items: ref('ApiObject') },
        },
      },
      UnreadCountResponse: {
        type: 'object',
        properties: {
          total_unread_count: { type: 'integer' },
          conversations: { type: 'array', items: ref('ApiObject') },
        },
      },
      AdminDashboardSummaryResponse: {
        type: 'object',
        properties: {
          users: { type: 'integer' },
          products: { type: 'integer' },
          orders: { type: 'integer' },
          pending_support_messages: { type: 'integer' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          name: { type: 'string' },
          referralCode: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/health': { get: { tags: ['Health'], summary: 'Service health', responses: publicResponses({ status: 'ok', service: 'glossy-store-backend' }, ref('HealthResponse')) } },
    '/info': {
      get: {
        tags: ['Health'],
        summary: 'Service metadata',
        responses: publicResponses({
          name: 'Glossy Store Backend',
          version: '1.0.0',
          environment: 'production',
          owner: 'OLUWAYEMI OYINLOLA MICHAEL',
          portfolio: 'https://oyinlola.site',
          docs_url: '/api/docs',
        }, ref('ApiObject')),
      },
    },

    '/auth/register': {
      post: {
        tags: ['Auth'], summary: 'Register user',
        requestBody: { required: true, content: jsonContent({ $ref: '#/components/schemas/RegisterRequest' }) },
        responses: { ...publicResponses({ message: 'Registration successful. Please verify your email with OTP.' }), 201: { description: 'Created', content: jsonContent({ type: 'object' }, { message: 'Registration successful. Please verify your email with OTP.' }) } },
      },
    },
    '/auth/verify-otp': { post: { tags: ['Auth'], summary: 'Verify OTP', requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: publicResponses({ message: 'OTP verified successfully' }) } },
    '/auth/login': { post: { tags: ['Auth'], summary: 'Login', requestBody: { required: true, content: jsonContent({ $ref: '#/components/schemas/LoginRequest' }) }, responses: publicResponses({ token: 'jwt-token', user: { id: 1, email: 'user@example.com', role: 'user' } }, ref('AuthResponse')) } },
    '/auth/verify-login-otp': { post: { tags: ['Auth'], summary: 'Verify login OTP', requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: publicResponses({ token: 'jwt-token', user: { id: 1 } }) } },
    '/auth/forgot-password': { post: { tags: ['Auth'], summary: 'Forgot password', requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: publicResponses({ message: 'OTP sent to your email' }) } },
    '/auth/reset-password': { post: { tags: ['Auth'], summary: 'Reset password', requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: publicResponses({ message: 'Password reset successful' }) } },
    '/auth/change-password': { post: { tags: ['Auth'], summary: 'Change password', security: [{ bearerAuth: [] }], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ message: 'Password changed successfully' }) } },
    '/auth/request-delete-account': { post: { tags: ['Auth'], summary: 'Request delete account', security: [{ bearerAuth: [] }], responses: authResponses({ message: 'OTP sent to your email for confirmation' }) } },
    '/auth/confirm-delete-account': { post: { tags: ['Auth'], summary: 'Confirm delete account', security: [{ bearerAuth: [] }], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ message: 'Account deleted successfully' }) } },
    '/auth/google': { get: { tags: ['Auth'], summary: 'Google OAuth start', responses: { ...publicResponses({ message: 'Redirect' }), 302: { description: 'Redirect to provider' } } } },
    '/auth/google/callback': { get: { tags: ['Auth'], summary: 'Google OAuth callback', responses: publicResponses({ token: 'jwt-token', user: { id: 1 } }) } },
    '/auth/apple': { get: { tags: ['Auth'], summary: 'Apple OAuth start', responses: { ...publicResponses({ message: 'Redirect' }), 302: { description: 'Redirect to provider' } } } },
    '/auth/apple/callback': { get: { tags: ['Auth'], summary: 'Apple OAuth callback', responses: publicResponses({ token: 'jwt-token', user: { id: 1 } }) } },

    '/user/profile': {
      get: { tags: ['Users'], summary: 'Get profile', security: [{ bearerAuth: [] }], responses: authResponses({ id: 1, email: 'user@example.com', role: 'user' }) },
      put: { tags: ['Users'], summary: 'Update profile', security: [{ bearerAuth: [] }], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ message: 'Profile updated' }) },
    },
    '/user/wishlist': { get: { tags: ['Users'], summary: 'Get wishlist', security: [{ bearerAuth: [] }], responses: authResponses([]) } },
    '/user/wishlist/{productId}': {
      post: { tags: ['Users'], summary: 'Add wishlist', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'integer' } }], responses: authResponses({ id: 1 }) },
      delete: { tags: ['Users'], summary: 'Remove wishlist', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'integer' } }], responses: authResponses({ message: 'Removed from wishlist' }) },
    },
    '/user/referral': { get: { tags: ['Users'], summary: 'Referral info', security: [{ bearerAuth: [] }], responses: authResponses({ referralCode: 'ABC12345', referrals: [] }) } },

    '/products': {
      get: {
        tags: ['Products'], summary: 'List products',
        parameters: [
          { in: 'query', name: 'category', schema: { type: 'integer' } },
          { in: 'query', name: 'minPrice', schema: { type: 'number' } },
          { in: 'query', name: 'maxPrice', schema: { type: 'number' } },
          { in: 'query', name: 'rating', schema: { type: 'number' } },
          { in: 'query', name: 'flashSale', schema: { type: 'boolean' } },
          { in: 'query', name: 'newArrivals', schema: { type: 'boolean' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
        ],
        responses: publicResponses({ total: 1, page: 1, pages: 1, products: [] }, ref('ProductListResponse')),
      },
    },
    '/products/{id}': { get: { tags: ['Products'], summary: 'Get product', parameters: [pathIdParam], responses: publicResponses({ id: 1, name: 'Product' }) } },
    '/products/{id}/rate': { post: { tags: ['Products'], summary: 'Rate product', security: [{ bearerAuth: [] }], parameters: [pathIdParam], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ id: 1, rating: 5 }) } },
    '/products/{id}/comment': { post: { tags: ['Products'], summary: 'Comment product', security: [{ bearerAuth: [] }], parameters: [pathIdParam], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ id: 1, comment: 'Great item' }) } },

    '/cart': {
      get: { tags: ['Cart'], summary: 'Get cart', security: [{ bearerAuth: [] }], responses: authResponses({ id: 1, CartItems: [] }) },
      post: { tags: ['Cart'], summary: 'Add cart item', security: [{ bearerAuth: [] }], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ id: 1, quantity: 1 }) },
    },
    '/cart/{itemId}': {
      put: { tags: ['Cart'], summary: 'Update cart item', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'itemId', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ id: 1, quantity: 2 }) },
      delete: { tags: ['Cart'], summary: 'Delete cart item', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'itemId', required: true, schema: { type: 'integer' } }], responses: authResponses({ message: 'Item removed' }) },
    },

    '/orders/checkout': { post: { tags: ['Orders'], summary: 'Checkout', security: [{ bearerAuth: [] }], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ order: { id: 1 }, payment: { status: true } }) } },
    '/orders': { get: { tags: ['Orders'], summary: 'List orders', security: [{ bearerAuth: [] }], responses: authResponses([]) } },
    '/orders/{id}': { get: { tags: ['Orders'], summary: 'Order details', security: [{ bearerAuth: [] }], parameters: [pathIdParam], responses: authResponses({ id: 1, status: 'paid' }) } },
    '/orders/{id}/status': { get: { tags: ['Orders'], summary: 'Order status', security: [{ bearerAuth: [] }], parameters: [pathIdParam], responses: authResponses({ id: 1, status: 'out_for_delivery' }) } },
    '/orders/{id}/cancel': { patch: { tags: ['Orders'], summary: 'Cancel order', security: [{ bearerAuth: [] }], parameters: [pathIdParam], responses: authResponses({ message: 'Order cancelled successfully' }) } },

    '/support/conversations': {
      post: {
        tags: ['Support'], summary: 'Create support conversation', security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: { 'multipart/form-data': { schema: { type: 'object', properties: { subject: { type: 'string' }, message: { type: 'string' }, attachments: { type: 'array', items: { type: 'string', format: 'binary' } } } } } },
        },
        responses: authResponses({ conversation: { id: 1, status: 'open' }, firstMessage: null }),
      },
      get: { tags: ['Support'], summary: 'List support conversations', security: [{ bearerAuth: [] }], responses: authResponses([]) },
    },
    '/support/unread-count': { get: { tags: ['Support'], summary: 'Unread support count', security: [{ bearerAuth: [] }], responses: authResponses({ total_unread_count: 0, conversations: [] }, ref('UnreadCountResponse')) } },
    '/support/conversations/{id}/messages': {
      get: { tags: ['Support'], summary: 'Get support messages', security: [{ bearerAuth: [] }], parameters: [pathIdParam], responses: authResponses({ conversation: { id: 1 }, messages: [] }) },
      post: {
        tags: ['Support'], summary: 'Send support message', security: [{ bearerAuth: [] }], parameters: [pathIdParam],
        requestBody: {
          required: false,
          content: { 'multipart/form-data': { schema: { type: 'object', properties: { message: { type: 'string' }, attachments: { type: 'array', items: { type: 'string', format: 'binary' } } } } } },
        },
        responses: authResponses({ id: 1, message: 'Hello support' }),
      },
    },
    '/support/conversations/{id}/read': { patch: { tags: ['Support'], summary: 'Mark read', security: [{ bearerAuth: [] }], parameters: [pathIdParam], responses: authResponses({ updatedCount: 2 }) } },
    '/support/conversations/{id}/status': { patch: { tags: ['Support'], summary: 'Update support status', security: [{ bearerAuth: [] }], parameters: [pathIdParam], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ id: 1, status: 'resolved' }) } },
    '/support/attachments/{attachmentId}/signed-url': { get: { tags: ['Support'], summary: 'Signed attachment URL', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'attachmentId', required: true, schema: { type: 'integer' } }], responses: authResponses({ signed_url: '/api/support/attachments/1/download?expires=123&sig=abc' }) } },
    '/support/attachments/{attachmentId}/download': {
      get: {
        tags: ['Support'], summary: 'Download support attachment', security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'attachmentId', required: true, schema: { type: 'integer' } },
          { in: 'query', name: 'expires', required: true, schema: { type: 'string' } },
          { in: 'query', name: 'sig', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Binary file stream' },
          401: { description: 'Invalid signature', content: jsonContent(errorSchema, { error: 'Invalid or expired attachment signature' }) },
          403: { description: 'Forbidden', content: jsonContent(errorSchema, { error: 'Access denied' }) },
          404: { description: 'Not found', content: jsonContent(errorSchema, { error: 'Attachment not found' }) },
          500: { description: 'Server error', content: jsonContent(errorSchema, { error: 'Something went wrong' }) },
        },
      },
    },

    '/coupons/validate': { post: { tags: ['Coupons'], summary: 'Validate coupon', requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: publicResponses({ valid: true, coupon: { id: 1, code: 'SAVE10', discountAmount: 100 } }) } },
    '/contact': { post: { tags: ['Contact'], summary: 'Submit contact message', requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: publicResponses({ message: 'Message sent', contact: { id: 1 } }) } },
    '/payments/webhook': { post: { tags: ['Payments'], summary: 'Payment webhook', requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: publicResponses({ message: 'Processed' }) } },

    '/admin/dashboard/summary': { get: { tags: ['Admin'], summary: 'Admin dashboard summary', security: [{ bearerAuth: [] }], responses: authResponses({ users: 10, products: 20, orders: 5, pending_support_messages: 1 }, ref('AdminDashboardSummaryResponse')) } },
    '/admin/admin-users': { post: { tags: ['Admin'], summary: 'Create admin user', security: [{ bearerAuth: [] }], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ id: 2, email: 'admin@example.com', role: 'admin' }) } },
    '/admin/categories': { post: { tags: ['Admin'], summary: 'Create category', security: [{ bearerAuth: [] }], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ id: 1, name: 'Category' }) } },
    '/admin/categories/{id}': {
      put: { tags: ['Admin'], summary: 'Update category', security: [{ bearerAuth: [] }], parameters: [pathIdParam], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ id: 1, name: 'Updated Category' }) },
      delete: { tags: ['Admin'], summary: 'Delete category', security: [{ bearerAuth: [] }], parameters: [pathIdParam], responses: authResponses({ message: 'Category deleted' }) },
    },
    '/admin/products': {
      get: { tags: ['Admin'], summary: 'List admin products', security: [{ bearerAuth: [] }], responses: authResponses([]) },
      post: { tags: ['Admin'], summary: 'Create product', security: [{ bearerAuth: [] }], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ id: 1, name: 'New Product' }) },
    },
    '/admin/products/{id}': {
      get: { tags: ['Admin'], summary: 'Get admin product', security: [{ bearerAuth: [] }], parameters: [pathIdParam], responses: authResponses({ id: 1, name: 'Product' }) },
      put: { tags: ['Admin'], summary: 'Update product', security: [{ bearerAuth: [] }], parameters: [pathIdParam], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ id: 1, name: 'Updated Product' }) },
      delete: { tags: ['Admin'], summary: 'Delete product', security: [{ bearerAuth: [] }], parameters: [pathIdParam], responses: authResponses({ message: 'Product deleted' }) },
    },
    '/admin/flash-sales': {
      post: { tags: ['Admin'], summary: 'Create flash sale', security: [{ bearerAuth: [] }], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ id: 1, name: 'Flash Sale' }) },
      get: { tags: ['Admin'], summary: 'List flash sales', security: [{ bearerAuth: [] }], responses: authResponses([]) },
    },
    '/admin/flash-sales/{id}': {
      put: { tags: ['Admin'], summary: 'Update flash sale', security: [{ bearerAuth: [] }], parameters: [pathIdParam], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ id: 1, name: 'Updated Flash Sale' }) },
      delete: { tags: ['Admin'], summary: 'Delete flash sale', security: [{ bearerAuth: [] }], parameters: [pathIdParam], responses: authResponses({ message: 'Flash sale deleted' }) },
    },
    '/admin/coupons': {
      post: { tags: ['Admin'], summary: 'Create coupon', security: [{ bearerAuth: [] }], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ id: 1, code: 'SAVE10' }) },
      get: { tags: ['Admin'], summary: 'List coupons', security: [{ bearerAuth: [] }], responses: authResponses([]) },
    },
    '/admin/coupons/{id}': {
      put: { tags: ['Admin'], summary: 'Update coupon', security: [{ bearerAuth: [] }], parameters: [pathIdParam], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ id: 1, code: 'SAVE10' }) },
      delete: { tags: ['Admin'], summary: 'Delete coupon', security: [{ bearerAuth: [] }], parameters: [pathIdParam], responses: authResponses({ message: 'Coupon deleted' }) },
    },
    '/admin/contact-messages': { get: { tags: ['Admin'], summary: 'List contact messages', security: [{ bearerAuth: [] }], responses: authResponses([]) } },
    '/admin/contact-messages/{id}/reply': { post: { tags: ['Admin'], summary: 'Reply contact message', security: [{ bearerAuth: [] }], parameters: [pathIdParam], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ message: 'Reply sent' }) } },
    '/admin/users': { get: { tags: ['Admin'], summary: 'List users', security: [{ bearerAuth: [] }], responses: authResponses([]) } },
    '/admin/orders': { get: { tags: ['Admin'], summary: 'List orders', security: [{ bearerAuth: [] }], responses: authResponses([]) } },
    '/admin/orders/{id}/status': { patch: { tags: ['Admin'], summary: 'Update order status', security: [{ bearerAuth: [] }], parameters: [pathIdParam], requestBody: { required: true, content: jsonContent({ type: 'object' }) }, responses: authResponses({ id: 1, status: 'delivered' }) } },
  },
};

const toPascal = (value) => String(value)
  .replace(/[^a-zA-Z0-9]+/g, ' ')
  .trim()
  .split(/\s+/)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('');

const ensureOperationIds = (spec) => {
  Object.entries(spec.paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, op]) => {
      if (op && !op.operationId) {
        const normalizedPath = path
          .replace(/[{}]/g, '')
          .replace(/\//g, ' ')
          .replace(/:/g, ' ');
        op.operationId = `${method.toLowerCase()}${toPascal(normalizedPath)}`;
      }
    });
  });
};

ensureOperationIds(swaggerSpec);

const mountSwagger = (app) => {
  app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

  try {
    const swaggerUi = require('swagger-ui-express');
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  } catch (err) {
    app.get('/api/docs', (req, res) => {
      res.status(501).json({
        error: 'Swagger UI dependency not installed',
        message: 'Install swagger-ui-express to view interactive docs.',
        docsJson: '/api/docs.json',
      });
    });
  }
};

module.exports = { mountSwagger, swaggerSpec };
