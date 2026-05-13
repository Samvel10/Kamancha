const mongoose = require('mongoose');

const localizedStringSchema = new mongoose.Schema(
  { hy: String, en: String, ru: String, fr: String, de: String, it: String, es: String, zh: String, hi: String, ar: String },
  { _id: false }
);

const menuItemSchema = new mongoose.Schema({
  name: { type: localizedStringSchema, required: true },
  description: { type: localizedStringSchema, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, index: true },
  image_url: { type: String, default: '' },
  is_available: { type: Boolean, default: true, index: true },
  is_popular: { type: Boolean, default: false, index: true },
  sort_order: { type: Number, default: 0 },
  tags: [String],
}, { timestamps: true });

menuItemSchema.index({ category: 1, is_available: 1, sort_order: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
