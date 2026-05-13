const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const { requireMinRole } = require('../middleware/auth');

function optionalUser(req, _res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try { req.user = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET); } catch { /* anon */ }
  }
  next();
}

// Submit feedback — anyone (anon or logged-in)
router.post('/', optionalUser, async (req, res, next) => {
  try {
    const { rating, text } = req.body;
    const r = parseInt(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) return res.status(400).json({ error: 'rating 1–5 required' });
    if (!text || text.length < 5 || text.length > 1000) return res.status(400).json({ error: 'text 5–1000 chars' });

    const fb = await prisma.feedback.create({
      data: { rating: r, text, userId: req.user?.id || null },
    });
    res.status(201).json({ data: { id: fb.id, message: 'thanks' } });
  } catch (err) { next(err); }
});

// User's own feedback list
router.get('/me', ...requireMinRole('USER'), async (req, res, next) => {
  try {
    const list = await prisma.feedback.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: list });
  } catch (err) { next(err); }
});

// Public approved feedback (for display)
router.get('/', async (req, res, next) => {
  try {
    const list = await prisma.feedback.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { name: true } } },
    });
    res.json({ data: list });
  } catch (err) { next(err); }
});

// Staff moderation queue — Manager+ approves
router.get('/moderation', ...requireMinRole('MANAGER'), async (req, res, next) => {
  try {
    const list = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json({ data: list });
  } catch (err) { next(err); }
});

router.patch('/:id/approve', ...requireMinRole('MANAGER'), async (req, res, next) => {
  try {
    const fb = await prisma.feedback.update({
      where: { id: parseInt(req.params.id) },
      data: { approved: true },
    });
    res.json({ data: fb });
  } catch (err) { next(err); }
});

router.delete('/:id', ...requireMinRole('MANAGER'), async (req, res, next) => {
  try {
    await prisma.feedback.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
