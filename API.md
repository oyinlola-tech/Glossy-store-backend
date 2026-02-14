# Glossy Store Backend API

Version: `2.0.5`

Base URL: `/api`

This file is generated from `src/config/swagger.js` to keep endpoint docs 1:1 with Swagger.

## Tag Groups
- **Core**: Health, Auth, Users
- **Commerce**: Products, Cart, Orders, Coupons
- **Support**: Support, Contact
- **Operations**: Payments, Admin

## Operation Index
| Method | Path | operationId | Tag | Auth | Summary |
|---|---|---|---|---|---|
| GET | `/health` | `getHealth` | Health | No | Service health |
| GET | `/info` | `getInfo` | Health | No | Service metadata |
| POST | `/auth/register` | `postAuthRegister` | Auth | No | Register user |
| POST | `/auth/verify-otp` | `postAuthVerifyOtp` | Auth | No | Verify OTP |
| POST | `/auth/login` | `postAuthLogin` | Auth | No | Login |
| POST | `/auth/verify-login-otp` | `postAuthVerifyLoginOtp` | Auth | No | Verify login OTP |
| POST | `/auth/forgot-password` | `postAuthForgotPassword` | Auth | No | Forgot password |
| POST | `/auth/reset-password` | `postAuthResetPassword` | Auth | No | Reset password |
| POST | `/auth/change-password` | `postAuthChangePassword` | Auth | Yes | Change password |
| POST | `/auth/request-delete-account` | `postAuthRequestDeleteAccount` | Auth | Yes | Request delete account |
| POST | `/auth/confirm-delete-account` | `postAuthConfirmDeleteAccount` | Auth | Yes | Confirm delete account |
| GET | `/auth/google` | `getAuthGoogle` | Auth | No | Google OAuth start |
| GET | `/auth/google/callback` | `getAuthGoogleCallback` | Auth | No | Google OAuth callback |
| GET | `/auth/apple` | `getAuthApple` | Auth | No | Apple OAuth start |
| GET | `/auth/apple/callback` | `getAuthAppleCallback` | Auth | No | Apple OAuth callback |
| GET | `/user/profile` | `getUserProfile` | Users | Yes | Get profile |
| PUT | `/user/profile` | `putUserProfile` | Users | Yes | Update profile |
| GET | `/user/wishlist` | `getUserWishlist` | Users | Yes | Get wishlist |
| POST | `/user/wishlist/{productId}` | `postUserWishlistProductId` | Users | Yes | Add wishlist |
| DELETE | `/user/wishlist/{productId}` | `deleteUserWishlistProductId` | Users | Yes | Remove wishlist |
| GET | `/user/referral` | `getUserReferral` | Users | Yes | Referral info |
| GET | `/products` | `getProducts` | Products | No | List products |
| GET | `/products/{id}` | `getProductsId` | Products | No | Get product |
| POST | `/products/{id}/rate` | `postProductsIdRate` | Products | Yes | Rate product |
| POST | `/products/{id}/comment` | `postProductsIdComment` | Products | Yes | Comment product |
| GET | `/cart` | `getCart` | Cart | Yes | Get cart |
| POST | `/cart` | `postCart` | Cart | Yes | Add cart item |
| PUT | `/cart/{itemId}` | `putCartItemId` | Cart | Yes | Update cart item |
| DELETE | `/cart/{itemId}` | `deleteCartItemId` | Cart | Yes | Delete cart item |
| POST | `/orders/checkout` | `postOrdersCheckout` | Orders | Yes | Checkout |
| GET | `/orders` | `getOrders` | Orders | Yes | List orders |
| GET | `/orders/{id}` | `getOrdersId` | Orders | Yes | Order details |
| GET | `/orders/{id}/status` | `getOrdersIdStatus` | Orders | Yes | Order status |
| PATCH | `/orders/{id}/cancel` | `patchOrdersIdCancel` | Orders | Yes | Cancel order |
| GET | `/support/conversations` | `getSupportConversations` | Support | Yes | List support conversations |
| POST | `/support/conversations` | `postSupportConversations` | Support | Yes | Create support conversation |
| GET | `/support/unread-count` | `getSupportUnreadCount` | Support | Yes | Unread support count |
| GET | `/support/conversations/{id}/messages` | `getSupportConversationsIdMessages` | Support | Yes | Get support messages |
| POST | `/support/conversations/{id}/messages` | `postSupportConversationsIdMessages` | Support | Yes | Send support message |
| PATCH | `/support/conversations/{id}/read` | `patchSupportConversationsIdRead` | Support | Yes | Mark read |
| PATCH | `/support/conversations/{id}/status` | `patchSupportConversationsIdStatus` | Support | Yes | Update support status |
| GET | `/support/attachments/{attachmentId}/signed-url` | `getSupportAttachmentsAttachmentIdSignedUrl` | Support | Yes | Signed attachment URL |
| GET | `/support/attachments/{attachmentId}/download` | `getSupportAttachmentsAttachmentIdDownload` | Support | Yes | Download support attachment |
| POST | `/coupons/validate` | `postCouponsValidate` | Coupons | No | Validate coupon |
| POST | `/contact` | `postContact` | Contact | No | Submit contact message |
| POST | `/payments/webhook` | `postPaymentsWebhook` | Payments | No | Payment webhook |
| GET | `/admin/dashboard/summary` | `getAdminDashboardSummary` | Admin | Yes | Admin dashboard summary |
| POST | `/admin/admin-users` | `postAdminAdminUsers` | Admin | Yes | Create admin user |
| POST | `/admin/categories` | `postAdminCategories` | Admin | Yes | Create category |
| PUT | `/admin/categories/{id}` | `putAdminCategoriesId` | Admin | Yes | Update category |
| DELETE | `/admin/categories/{id}` | `deleteAdminCategoriesId` | Admin | Yes | Delete category |
| GET | `/admin/products` | `getAdminProducts` | Admin | Yes | List admin products |
| POST | `/admin/products` | `postAdminProducts` | Admin | Yes | Create product |
| GET | `/admin/products/{id}` | `getAdminProductsId` | Admin | Yes | Get admin product |
| PUT | `/admin/products/{id}` | `putAdminProductsId` | Admin | Yes | Update product |
| DELETE | `/admin/products/{id}` | `deleteAdminProductsId` | Admin | Yes | Delete product |
| GET | `/admin/flash-sales` | `getAdminFlashSales` | Admin | Yes | List flash sales |
| POST | `/admin/flash-sales` | `postAdminFlashSales` | Admin | Yes | Create flash sale |
| PUT | `/admin/flash-sales/{id}` | `putAdminFlashSalesId` | Admin | Yes | Update flash sale |
| DELETE | `/admin/flash-sales/{id}` | `deleteAdminFlashSalesId` | Admin | Yes | Delete flash sale |
| GET | `/admin/coupons` | `getAdminCoupons` | Admin | Yes | List coupons |
| POST | `/admin/coupons` | `postAdminCoupons` | Admin | Yes | Create coupon |
| PUT | `/admin/coupons/{id}` | `putAdminCouponsId` | Admin | Yes | Update coupon |
| DELETE | `/admin/coupons/{id}` | `deleteAdminCouponsId` | Admin | Yes | Delete coupon |
| GET | `/admin/contact-messages` | `getAdminContactMessages` | Admin | Yes | List contact messages |
| POST | `/admin/contact-messages/{id}/reply` | `postAdminContactMessagesIdReply` | Admin | Yes | Reply contact message |
| GET | `/admin/users` | `getAdminUsers` | Admin | Yes | List users |
| GET | `/admin/orders` | `getAdminOrders` | Admin | Yes | List orders |
| PATCH | `/admin/orders/{id}/status` | `patchAdminOrdersIdStatus` | Admin | Yes | Update order status |

## Notes
- Use Swagger UI for full request/response examples: `/api/docs`.
- Use Swagger JSON for SDK generation: `/api/docs.json`.
