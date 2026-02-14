# Glossy Store Backend API

Base URL: `http://localhost:5000/api`  
Auth: `Authorization: Bearer <JWT>`

## Security Notes
- Support attachments are private and only downloadable with:
  - authenticated user access
  - signed URL (`sig`, `expires`) validation
- Attachment upload security:
  - file-type allowlist
  - binary signature (magic-byte) verification
- optional virus scan hook (`VIRUS_SCAN_ENABLED=true`)
- Rate limiting and Helmet headers are enabled globally.
- Payment webhook signature validation is enforced when `PAYSTACK_SECRET_KEY` is set.

## Production Startup

`npm start` now performs:
1. Database creation if missing.
2. Migration execution (`AUTO_RUN_MIGRATIONS=true`).
3. Model sync fallback (`AUTO_SYNC_MODELS=true`).
4. Super-admin bootstrap from env.

Recommended production values:
- `AUTO_RUN_MIGRATIONS=true`
- `AUTO_SYNC_MODELS=false` after schema is stable and fully migration-driven

## Authentication

### `POST /auth/register`
Request:
```json
{
  "email": "user@example.com",
  "password": "StrongPass123",
  "name": "John Doe",
  "referralCode": "ABC12345"
}
```
Response `201`:
```json
{ "message": "Registration successful. Please verify your email with OTP." }
```

### `POST /auth/verify-otp`
Request:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "purpose": "registration"
}
```
Response `200`:
```json
{ "message": "OTP verified successfully" }
```

### `POST /auth/login`
Request:
```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```
Response `200`:
```json
{
  "token": "jwt",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "is_super_admin": false
  }
}
```

### `POST /auth/verify-login-otp`
Request:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```
Response: same as login success.

### `POST /auth/forgot-password`
Request:
```json
{ "email": "user@example.com" }
```
Response:
```json
{ "message": "OTP sent to your email" }
```

### `POST /auth/reset-password`
Request:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewStrongPass123"
}
```
Response:
```json
{ "message": "Password reset successful" }
```

### `POST /auth/change-password` (auth)
Request:
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```
Response:
```json
{ "message": "Password changed successfully" }
```

### `POST /auth/request-delete-account` (auth)
Response:
```json
{ "message": "OTP sent to your email for confirmation" }
```

### `POST /auth/confirm-delete-account` (auth)
Request:
```json
{ "otp": "123456" }
```
Response:
```json
{ "message": "Account deleted successfully" }
```

### Social OAuth
- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /auth/apple`
- `GET /auth/apple/callback`

Successful callback response:
```json
{
  "token": "jwt",
  "user": {
    "id": 1,
    "name": "User",
    "email": "user@example.com",
    "role": "user",
    "is_super_admin": false
  }
}
```

## User

### `GET /user/profile` (auth)
Response:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "role": "user",
  "is_super_admin": false,
  "referral_code": "ABC12345"
}
```

### `PUT /user/profile` (auth)
Request:
```json
{ "name": "New Name" }
```
Response:
```json
{
  "message": "Profile updated",
  "user": { "id": 1, "name": "New Name" }
}
```

### Wishlist
- `GET /user/wishlist` (auth)
- `POST /user/wishlist/:productId` (auth)
- `DELETE /user/wishlist/:productId` (auth)

### Referral
- `GET /user/referral` (auth)

## Products

### `GET /products`
Query params:
- `category`, `minPrice`, `maxPrice`, `rating`, `flashSale`, `newArrivals`, `page`, `limit`

Response:
```json
{
  "total": 100,
  "page": 1,
  "pages": 5,
  "products": [
    {
      "id": 10,
      "name": "Luxury Bag",
      "base_price": "250.00",
      "compare_at_price": "300.00",
      "current_price": 250,
      "original_price": 300,
      "has_discount": true,
      "discount_label": "17% OFF",
      "stock": 4,
      "is_out_of_stock": false
    }
  ]
}
```

### `GET /products/:id`
Response includes images/colors/sizes/variants/ratings/comments plus:
- `current_price`, `original_price`, `has_discount`, `discount_label`
- `stock`, `is_out_of_stock`

### Rating & Comment
- `POST /products/:id/rate` (auth)
  - `{ "rating": 5, "review": "Excellent" }`
- `POST /products/:id/comment` (auth)
  - `{ "comment": "Fast delivery!" }`

## Cart

### `GET /cart` (auth)
### `POST /cart` (auth)
Request:
```json
{ "productVariantId": 21, "quantity": 2 }
```
Response `409` possible:
```json
{ "error": "Only 1 units available" }
```

### `PUT /cart/:itemId` (auth)
### `DELETE /cart/:itemId` (auth)

## Orders

### `POST /orders/checkout` (auth)
Request:
```json
{
  "shippingAddress": "123 Main St, Lagos",
  "couponCode": "SAVE10"
}
```
Notes:
- Uses DB transaction
- Locks stock rows
- Deducts variant stock
- Recomputes product stock
- Keeps product record even at zero stock

Response:
```json
{
  "order": {
    "id": 20,
    "order_number": "ORD-1234ABCD",
    "status": "pending",
    "payment_status": "pending"
  },
  "payment": { "status": true, "data": {} }
}
```

### `GET /orders` (auth)
### `GET /orders/:id` (auth)
### `GET /orders/:id/status` (auth)
Response status sample:
```json
{
  "id": 20,
  "order_number": "ORD-1234ABCD",
  "status": "out_for_delivery",
  "status_note": "Rider assigned",
  "payment_status": "success",
  "out_for_delivery_at": "2026-02-14T08:00:00.000Z",
  "delivered_at": null,
  "cancelled_at": null,
  "refunded_at": null
}
```

## Coupons

### `POST /coupons/validate`
Request:
```json
{ "code": "SAVE10", "cartTotal": 500 }
```
Response:
```json
{
  "valid": true,
  "coupon": {
    "id": 1,
    "code": "SAVE10",
    "discount_type": "percentage",
    "discount_value": "10.00",
    "discountAmount": 50
  }
}
```

## Contact

### `POST /contact` (guest or auth)
Request:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Need help with my order"
}
```
Response:
```json
{ "message": "Message sent", "contact": { "id": 1 } }
```

## Payments

### `POST /payments/webhook`
Payment provider webhook endpoint.

## Support Chat (REST)

All support routes require auth.

### `POST /support/conversations` (multipart)
Fields:
- `subject` (optional)
- `message` (optional if attachments provided)
- `attachments` (0..5 files)

Response:
```json
{
  "conversation": { "id": 1, "status": "open" },
  "firstMessage": {
    "id": 100,
    "message": "Hello support",
    "SupportMessageAttachments": [
      {
        "id": 7,
        "file_name": "invoice.pdf",
        "mime_type": "application/pdf",
        "file_size": 12232,
        "signed_download_url": "/api/support/attachments/7/download?expires=...&sig=..."
      }
    ],
    "receipts": [
      {
        "recipient_user_id": 2,
        "delivered_at": null,
        "read_at": null
      }
    ]
  }
}
```

### `GET /support/conversations`
Response: conversations list with `unread_count` per conversation.

### `GET /support/unread-count`
Response:
```json
{
  "total_unread_count": 4,
  "conversations": [
    { "conversation_id": 1, "unread_count": 3 },
    { "conversation_id": 2, "unread_count": 1 }
  ]
}
```

### `GET /support/conversations/:id/messages`
Response:
```json
{
  "conversation": { "id": 1, "status": "open" },
  "messages": [
    {
      "id": 100,
      "sender_role": "user",
      "message": "Hello",
      "SupportMessageAttachments": [],
      "receipts": [
        {
          "recipient_user_id": 2,
          "delivered_at": "2026-02-14T10:00:00.000Z",
          "read_at": null
        }
      ]
    }
  ]
}
```

### `POST /support/conversations/:id/messages` (multipart)
Fields:
- `message` (optional if attachments exist)
- `attachments` (0..5 files)

### `PATCH /support/conversations/:id/read`
Marks unread receipts for current user as read.

### Delivery/read receipts behavior
- Every support message creates receipt rows per recipient user.
- `delivered_at` is set when a recipient joins/loads conversation.
- `read_at` is set when recipient marks read (REST or socket).
- Admin receipts are user-specific, not role-wide aggregate.

### `PATCH /support/conversations/:id/status` (admin only)
Request:
```json
{ "status": "resolved" }
```

### Attachment URL APIs

### `GET /support/attachments/:attachmentId/signed-url`
Response:
```json
{
  "attachment_id": 7,
  "file_name": "invoice.pdf",
  "mime_type": "application/pdf",
  "file_size": 12232,
  "signed_url": "/api/support/attachments/7/download?expires=...&sig=..."
}
```

### `GET /support/attachments/:attachmentId/download?expires=...&sig=...`
Returns binary file if:
- user can access conversation
- signature valid
- URL not expired

## Admin APIs (auth + admin)

### Admin users (super admin only)
- `POST /admin/admin-users`
```json
{
  "name": "Support Admin",
  "email": "admin2@glossystore.com",
  "password": "StrongAdminPass"
}
```

### Category
- `POST /admin/categories`
- `PUT /admin/categories/:id`
- `DELETE /admin/categories/:id`

### Products
- `POST /admin/products` (multipart `images`, max 10)
- `PUT /admin/products/:id` (multipart)
- `DELETE /admin/products/:id`

Product payload fields:
- `category_id`, `name`, `description`
- `base_price`, `compare_at_price`, `discount_label`
- `stock` (fallback if no variants)
- `colors[]`, `sizes[]`, `variants[]`

### Flash sales
- `POST /admin/flash-sales`
- `GET /admin/flash-sales`
- `PUT /admin/flash-sales/:id`
- `DELETE /admin/flash-sales/:id`

### Coupons
- `POST /admin/coupons`
- `GET /admin/coupons`
- `PUT /admin/coupons/:id`
- `DELETE /admin/coupons/:id`

### Contact admin
- `GET /admin/contact-messages`
- `POST /admin/contact-messages/:id/reply`

### Users & Orders
- `GET /admin/users`
- `GET /admin/orders`
- `PATCH /admin/orders/:id/status`
```json
{
  "status": "out_for_delivery",
  "status_note": "Courier assigned"
}
```

## Support Chat (WebSocket)

Namespace: default Socket.IO connection.

Client auth:
```js
io(SERVER_URL, { auth: { token: JWT } })
```

Events:
- `support:join` `{ conversationId }`
- `support:message` `{ conversationId, message }`
- `support:typing` `{ conversationId, isTyping }`
- `support:mark_read` `{ conversationId }`

Server emits:
- `support:joined`
- `support:new_message`
- `support:typing`
- `support:conversation_read`
- `support:refresh_unread`
- `support:unread_count`
- `support:error`

## Error Response Pattern
Most failures return:
```json
{ "error": "Human readable message" }
```

Common statuses:
- `400` bad request
- `401` unauthorized
- `403` forbidden
- `404` not found
- `409` conflict (e.g., insufficient stock)
- `500` server error

## Testing

### Run smoke tests
```bash
npm test
```

These tests verify that all declared endpoints are reachable (non-404/non-405).  
For full integration tests (DB, mail, payment, OAuth), configure `.env`, run MySQL, then test with Postman/Swagger against a seeded environment.

## Virus Scan Setup

Current `.env` values:
- `VIRUS_SCAN_ENABLED=false`
- `VIRUS_SCAN_COMMAND=clamscan`
- `VIRUS_SCAN_ARGS=--no-summary --infected`
- `VIRUS_SCAN_COMMAND_WINDOWS=C:\Program Files\ClamAV\clamscan.exe`

To enable scanning:
1. Install ClamAV on your server.
2. Update command path if needed.
3. Set `VIRUS_SCAN_ENABLED=true`.
