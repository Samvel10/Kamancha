const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image_url: { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: Number, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  notes: { type: String, default: '' },
  items: { type: [orderItemSchema], required: true },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERED', 'CANCELLED'], default: 'PENDING', index: true },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
