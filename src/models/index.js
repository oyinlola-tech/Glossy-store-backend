const sequelize = require('../config/database');
const User = require('./User');
const OTP = require('./OTP');
const SocialAccount = require('./SocialAccount');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const ProductColor = require('./ProductColor');
const ProductSize = require('./ProductSize');
const ProductVariant = require('./ProductVariant');
const Rating = require('./Rating');
const Comment = require('./Comment');
const Wishlist = require('./Wishlist');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Coupon = require('./Coupon');
const FlashSale = require('./FlashSale');
const FlashSaleProduct = require('./FlashSaleProduct');
const ContactMessage = require('./ContactMessage');
const Referral = require('./Referral');
const SupportConversation = require('./SupportConversation');
const SupportMessage = require('./SupportMessage');
const SupportMessageAttachment = require('./SupportMessageAttachment');
const SupportMessageReceipt = require('./SupportMessageReceipt');

// User associations
User.hasMany(OTP, { foreignKey: 'user_id' });
User.hasMany(SocialAccount, { foreignKey: 'user_id' });
User.hasMany(Rating, { foreignKey: 'user_id' });
User.hasMany(Comment, { foreignKey: 'user_id' });
User.hasMany(Wishlist, { foreignKey: 'user_id' });
User.hasOne(Cart, { foreignKey: 'user_id' });
User.hasMany(Order, { foreignKey: 'user_id' });
User.hasMany(ContactMessage, { foreignKey: 'user_id' });
User.hasMany(SupportConversation, { foreignKey: 'user_id' });
User.hasMany(SupportMessage, { foreignKey: 'sender_user_id' });
User.hasMany(Referral, { as: 'referralsMade', foreignKey: 'referrer_user_id' });
User.belongsTo(User, { as: 'referrer', foreignKey: 'referred_by' });
User.hasMany(User, { as: 'adminsCreated', foreignKey: 'created_by_admin_id' });
User.belongsTo(User, { as: 'createdByAdmin', foreignKey: 'created_by_admin_id' });

// OTP belongs to User
OTP.belongsTo(User, { foreignKey: 'user_id' });

// SocialAccount belongs to User
SocialAccount.belongsTo(User, { foreignKey: 'user_id' });

// Category
Category.hasMany(Product, { foreignKey: 'category_id' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parent_id' });

// Product
Product.belongsTo(Category, { foreignKey: 'category_id' });
Product.hasMany(ProductImage, { foreignKey: 'product_id' });
Product.hasMany(ProductColor, { foreignKey: 'product_id' });
Product.hasMany(ProductSize, { foreignKey: 'product_id' });
Product.hasMany(ProductVariant, { foreignKey: 'product_id' });
Product.hasMany(Rating, { foreignKey: 'product_id' });
Product.hasMany(Comment, { foreignKey: 'product_id' });
Product.hasMany(Wishlist, { foreignKey: 'product_id' });
Product.belongsToMany(FlashSale, { through: FlashSaleProduct, foreignKey: 'product_id' });

// ProductImage
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

// ProductColor
ProductColor.belongsTo(Product, { foreignKey: 'product_id' });
ProductColor.hasMany(ProductVariant, { foreignKey: 'color_id' });

// ProductSize
ProductSize.belongsTo(Product, { foreignKey: 'product_id' });
ProductSize.hasMany(ProductVariant, { foreignKey: 'size_id' });

// ProductVariant
ProductVariant.belongsTo(Product, { foreignKey: 'product_id' });
ProductVariant.belongsTo(ProductColor, { foreignKey: 'color_id' });
ProductVariant.belongsTo(ProductSize, { foreignKey: 'size_id' });
ProductVariant.hasMany(CartItem, { foreignKey: 'product_variant_id' });
ProductVariant.hasMany(OrderItem, { foreignKey: 'product_variant_id' });

// Rating
Rating.belongsTo(User, { foreignKey: 'user_id' });
Rating.belongsTo(Product, { foreignKey: 'product_id' });

// Comment
Comment.belongsTo(User, { foreignKey: 'user_id' });
Comment.belongsTo(Product, { foreignKey: 'product_id' });

// Wishlist
Wishlist.belongsTo(User, { foreignKey: 'user_id' });
Wishlist.belongsTo(Product, { foreignKey: 'product_id' });

// Cart
Cart.belongsTo(User, { foreignKey: 'user_id' });
Cart.hasMany(CartItem, { foreignKey: 'cart_id' });

// CartItem
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'product_variant_id' });

// Order
Order.belongsTo(User, { foreignKey: 'user_id' });
Order.belongsTo(Coupon, { foreignKey: 'coupon_id' });
Order.hasMany(OrderItem, { foreignKey: 'order_id' });

// OrderItem
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'product_variant_id' });

// Coupon
Coupon.hasMany(Order, { foreignKey: 'coupon_id' });

// FlashSale
FlashSale.belongsToMany(Product, { through: FlashSaleProduct, foreignKey: 'flash_sale_id' });

// FlashSaleProduct
FlashSaleProduct.belongsTo(FlashSale, { foreignKey: 'flash_sale_id' });
FlashSaleProduct.belongsTo(Product, { foreignKey: 'product_id' });

// ContactMessage
ContactMessage.belongsTo(User, { foreignKey: 'user_id' });

// Referral
Referral.belongsTo(User, { as: 'referrer', foreignKey: 'referrer_user_id' });
Referral.belongsTo(User, { as: 'referred', foreignKey: 'referred_user_id' });

// Support chat
SupportConversation.belongsTo(User, { foreignKey: 'user_id' });
SupportConversation.hasMany(SupportMessage, { foreignKey: 'support_conversation_id' });
SupportMessage.belongsTo(SupportConversation, { foreignKey: 'support_conversation_id' });
SupportMessage.belongsTo(User, { foreignKey: 'sender_user_id' });
SupportMessage.hasMany(SupportMessageAttachment, { foreignKey: 'support_message_id' });
SupportMessageAttachment.belongsTo(SupportMessage, { foreignKey: 'support_message_id' });
SupportMessage.hasMany(SupportMessageReceipt, { foreignKey: 'support_message_id' });
SupportMessageReceipt.belongsTo(SupportMessage, { foreignKey: 'support_message_id' });
SupportMessageReceipt.belongsTo(User, { foreignKey: 'recipient_user_id' });

module.exports = {
  sequelize,
  User,
  OTP,
  SocialAccount,
  Category,
  Product,
  ProductImage,
  ProductColor,
  ProductSize,
  ProductVariant,
  Rating,
  Comment,
  Wishlist,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Coupon,
  FlashSale,
  FlashSaleProduct,
  ContactMessage,
  Referral,
  SupportConversation,
  SupportMessage,
  SupportMessageAttachment,
  SupportMessageReceipt,
};
