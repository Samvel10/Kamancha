const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { hy: String, en: String, ru: String, fr: String, de: String, it: String, es: String, zh: String, hi: String, ar: String },
  description: { hy: String, en: String, ru: String },
  date: { type: Date, required: true, index: true },
  time: String,
  image_url: String,
  type: { type: String, enum: ['music', 'special', 'holiday', 'other'], default: 'music' },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
