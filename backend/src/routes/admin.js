const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const GalleryItem = require('../models/GalleryItem');
const Event = require('../models/Event');
const { verifyAdmin, generateTokens, requireMinRole } = require('../middleware/auth');
const { requireResource } = require('../middleware/permissions');
const { validate, loginSchema, menuItemSchema } = require('../middleware/validate');
const { authLimiter } = require('../middleware/security');

// Admin login — uses User table, requires role=ADMIN and status=ACTIVE
router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await prisma.user.findUnique({ where: { email } });
    if (!admin || admin.role !== 'ADMIN') return res.status(401).json({ error: 'Invalid credentials' });
    if (admin.status !== 'ACTIVE') return res.status(403).json({ error: 'Account not active' });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { accessToken } = generateTokens({ id: admin.id, email: admin.email, role: admin.role });
    res.json({ accessToken, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (err) {
    next(err);
  }
});

// Reservations management
router.get('/reservations', ...requireResource('reservations', 'view'), async (req, res, next) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (date) where.date = new Date(date);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: { hall: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.reservation.count({ where }),
    ]);
    res.json({ data: reservations, total, page: parseInt(page) });
  } catch (err) {
    next(err);
  }
});

router.patch('/reservations/:id', ...requireResource('reservations', 'edit'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const reservation = await prisma.reservation.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      include: { hall: true },
    });
    res.json(reservation);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Reservation not found' });
    next(err);
  }
});

// Menu management
router.post('/menu', ...requireResource('menu', 'edit'), validate(menuItemSchema), async (req, res, next) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.put('/menu/:id', ...requireResource('menu', 'edit'), async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.delete('/menu/:id', ...requireResource('menu', 'delete'), async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

// Gallery management
router.get('/gallery', ...requireResource('gallery', 'view'), async (req, res, next) => {
  try {
    const items = await GalleryItem.find().sort({ sort_order: 1, createdAt: -1 }).lean();
    res.json({ data: items });
  } catch (err) {
    next(err);
  }
});

router.post('/gallery', ...requireResource('gallery', 'edit'), async (req, res, next) => {
  try {
    const item = await GalleryItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.delete('/gallery/:id', ...requireResource('gallery', 'delete'), async (req, res, next) => {
  try {
    const item = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Gallery item not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

// Events management
router.get('/events', ...requireResource('events', 'view'), async (req, res, next) => {
  try {
    const events = await Event.find().sort({ date: 1 }).lean();
    res.json({ data: events });
  } catch (err) {
    next(err);
  }
});

router.post('/events', ...requireResource('events', 'edit'), async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
});

router.delete('/events/:id', ...requireResource('events', 'delete'), async (req, res, next) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

// Dashboard stats
router.get('/stats', ...requireMinRole('DEVELOPER'), async (req, res, next) => {
  try {
    const [totalReservations, pendingReservations, totalMenuItems] = await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: 'PENDING' } }),
      MenuItem.countDocuments({ is_available: true }),
    ]);
    res.json({ totalReservations, pendingReservations, totalMenuItems });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
