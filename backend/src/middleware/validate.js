const Joi = require('joi');

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }
    req.body = value;
    next();
  };
}

const reservationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(/^\+?[\d\s\-()]{7,20}$/).required(),
  email: Joi.string().email().required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  guests: Joi.number().integer().min(1).max(200).required(),
  hallId: Joi.number().integer().positive().required(),
  notes: Joi.string().max(500).optional().allow(''),
  lang: Joi.string().valid('hy','en','ru','fr','de','it','es','zh','hi','ar').default('hy'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(/^\+?[\d\s\-()]{7,20}$/).optional().allow(''),
});

const orderSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().integer().min(1).required(),
    image_url: Joi.string().optional().allow(''),
  })).min(1).required(),
  address: Joi.string().min(5).max(300).required(),
  phone: Joi.string().pattern(/^\+?[\d\s\-()]{7,20}$/).required(),
  name: Joi.string().min(2).max(100).required(),
  notes: Joi.string().max(500).optional().allow(''),
});

const menuItemSchema = Joi.object({
  name: Joi.object().required(),
  description: Joi.object().required(),
  price: Joi.number().positive().required(),
  category: Joi.string().required(),
  image_url: Joi.string().uri().optional().allow(''),
  is_available: Joi.boolean().default(true),
  is_popular: Joi.boolean().default(false),
  sort_order: Joi.number().integer().default(0),
});

module.exports = { validate, reservationSchema, loginSchema, menuItemSchema, registerSchema, orderSchema };
