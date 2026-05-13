const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  url: { type: String, required: true },
  thumbnail_url: String,
  caption: { hy: String, en: String, ru: String },
  category: { type: String, enum: ['food', 'interior', 'events', 'team'], default: 'food', index: true },
  sort_order: { type: Number, default: 0 },
  is_visible: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('GalleryItem', gallerySchema);
