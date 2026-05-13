const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../config/db');
const { validate, reservationSchema } = require('../middleware/validate');
const { reservationLimiter } = require('../middleware/security');
const { sendConfirmationEmail } = require('../utils/email');

// Best-effort user lookup — attaches reservation to user if a valid token is sent,
// but anonymous bookings remain allowed.
function optionalUser(req, _res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    } catch { /* ignore — treat as anonymous */ }
  }
  next();
}

router.get('/check', async (req, res, next) => {
  try {
    const { date, time, hallId } = req.query;
    if (!date || !time || !hallId) {
      return res.status(400).json({ error: 'date, time and hallId are required' });
    }
    const existing = await prisma.reservation.findFirst({
      where: {
        date: new Date(date),
        time,
        hallId: parseInt(hallId),
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });
    res.json({ available: !existing });
  } catch (err) {
    next(err);
  }
});

router.post('/', reservationLimiter, optionalUser, validate(reservationSchema), async (req, res, next) => {
  try {
    const { name, phone, email, date, time, guests, hallId, notes, lang } = req.body;

    const hall = await prisma.hall.findUnique({ where: { id: hallId } });
    if (!hall) return res.status(404).json({ error: 'Hall not found' });
    if (guests > hall.capacity) {
      return res.status(400).json({ error: `Hall capacity is ${hall.capacity} guests` });
    }

    const conflict = await prisma.reservation.findFirst({
      where: { date: new Date(date), time, hallId, status: { in: ['PENDING', 'CONFIRMED'] } },
    });
    if (conflict) {
      return res.status(409).json({ error: 'This time slot is already taken' });
    }

    const confirmationCode = uuidv4().split('-')[0].toUpperCase();
    const reservation = await prisma.reservation.create({
      data: {
        name, phone, email,
        date: new Date(date),
        time, guests, hallId,
        notes: notes || null,
        lang: lang || 'hy',
        confirmationCode,
        status: 'PENDING',
        userId: req.user?.id || null,
      },
      include: { hall: true },
    });

    try {
      await sendConfirmationEmail({
        name, email, phone,
        date, time, guests,
        confirmationCode,
        hallName: hall.name,
        lang: lang || 'hy',
      });
    } catch {
      // Email failure shouldn't block reservation
    }

    res.status(201).json({
      message: 'Reservation created successfully',
      confirmationCode,
      id: reservation.id,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
