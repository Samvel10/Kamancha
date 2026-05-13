const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  author: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
  lang: { type: String, default: 'en' },
  source: { type: String, enum: ['tripadvisor', 'google', 'internal'], default: 'internal' },
  source_id: String,
  date: { type: Date, default: Date.now },
  is_visible: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
