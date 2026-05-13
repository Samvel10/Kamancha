const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: { type: Number, required: true, index: true },
  menuItemId: { type: String, required: true, index: true },
}, { timestamps: true });

favoriteSchema.index({ userId: 1, menuItemId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
