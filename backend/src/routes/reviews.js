const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

router.get('/', async (req, res, next) => {
  try {
    const { lang, source, limit = 20, page = 1 } = req.query;
    const filter = { is_visible: true };
    if (lang) filter.lang = lang;
    if (source) filter.source = source;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reviews, total] = await Promise.all([
      Review.find(filter).sort({ date: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Review.countDocuments(filter),
    ]);

    const avgRating = reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ data: reviews, total, avgRating: parseFloat(avgRating), page: parseInt(page) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
