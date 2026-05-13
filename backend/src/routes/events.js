const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

router.get('/', async (req, res, next) => {
  try {
    const { lang = 'en', type, upcoming = 'true' } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (upcoming === 'true') filter.date = { $gte: new Date() };

    const events = await Event.find(filter).sort({ date: 1 }).lean();
    const result = events.map((e) => ({
      _id: e._id,
      title: e.title,
      description: e.description,
      date: e.date,
      time: e.time,
      type: e.type,
    }));
    res.json({ data: result, total: result.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
