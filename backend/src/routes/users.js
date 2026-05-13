const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { prisma } = require('../config/db');
const Order = require('../models/Order');
const Favorite = require('../models/Favorite');
const MenuItem = require('../models/MenuItem');
const { verifyToken } = require('../middleware/auth');
const { validate, orderSchema } = require('../middleware/validate');

// ── Profile ───────────────────────────────────────────────────────────────
router.patch('/me', verifyToken, async (req, res, next) => {
  try {
    const { name, phone, password } = req.body;
    const data = {};
    if (name) data.name = name;
    if (phone !== undefined) data.phone = phone || null;
    if (password) data.password = await bcrypt.hash(password, 12);
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, email: true, name: true, phone: true, role: true },
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// ── Reservations ──────────────────────────────────────────────────────────
router.get('/me/reservations', verifyToken, async (req, res, next) => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { userId: req.user.id },
      include: { hall: true },
      orderBy: { date: 'desc' },
    });
    res.json({ data: reservations });
  } catch (err) {
    next(err);
  }
});

router.patch('/me/reservations/:id/cancel', verifyToken, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation || reservation.userId !== req.user.id) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    if (reservation.status === 'CANCELLED' || reservation.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Cannot cancel this reservation' });
    }
    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ── Orders ────────────────────────────────────────────────────────────────
router.post('/me/orders', verifyToken, validate(orderSchema), async (req, res, next) => {
  try {
    const { items, address, phone, name, notes } = req.body;
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const order = await Order.create({
      userId: req.user.id,
      name, phone, address, notes,
      items: items.map((i) => ({
        menuItemId: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image_url: i.image_url || '',
      })),
      total,
    });
    res.status(201).json({ data: order });
  } catch (err) {
    next(err);
  }
});

router.get('/me/orders', verifyToken, async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ data: orders });
  } catch (err) {
    next(err);
  }
});

// ── Favorites ─────────────────────────────────────────────────────────────
router.get('/me/favorites', verifyToken, async (req, res, next) => {
  try {
    const { lang = 'en' } = req.query;
    const favorites = await Favorite.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    const ids = favorites
      .map((f) => f.menuItemId)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));
    const items = await MenuItem.find({ _id: { $in: ids } }).lean();
    const itemMap = new Map(items.map((i) => [String(i._id), i]));
    const data = favorites
      .map((f) => {
        const it = itemMap.get(String(f.menuItemId));
        if (!it) return null;
        return {
          id: it._id,
          name: it.name?.[lang] || it.name?.en || it.name?.hy || '',
          name_hy: it.name?.hy || '',
          description: it.description?.[lang] || it.description?.en || '',
          price: it.price,
          category: it.category,
          image_url: it.image_url,
          is_available: it.is_available,
          is_popular: it.is_popular,
          favoritedAt: f.createdAt,
        };
      })
      .filter(Boolean);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post('/me/favorites/:menuItemId', verifyToken, async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
      return res.status(400).json({ error: 'Invalid menu item id' });
    }
    const exists = await MenuItem.findById(menuItemId).lean();
    if (!exists) return res.status(404).json({ error: 'Menu item not found' });

    try {
      const fav = await Favorite.create({ userId: req.user.id, menuItemId });
      res.status(201).json({ data: fav });
    } catch (err) {
      if (err.code === 11000) return res.json({ data: { menuItemId, userId: req.user.id, existed: true } });
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

router.delete('/me/favorites/:menuItemId', verifyToken, async (req, res, next) => {
  try {
    await Favorite.deleteOne({ userId: req.user.id, menuItemId: req.params.menuItemId });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
