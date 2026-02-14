const Joi = require('joi');

const productCreateSchema = Joi.object({
  category_id: Joi.number().required(),
  name: Joi.string().required(),
  description: Joi.string().optional(),
  base_price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).optional(),
  colors: Joi.array().items(Joi.object({
    color_name: Joi.string().required(),
    color_code: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).required(),
  })),
  sizes: Joi.array().items(Joi.string()),
  images: Joi.array().max(10),
});

module.exports = { productCreateSchema };