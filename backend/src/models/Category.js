const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: {
    hy: String, en: String, ru: String, fr: String, de: String,
    it: String, es: String, zh: String, hi: String, ar: String,
  },
  icon: String,
  sort_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
