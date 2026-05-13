const express = require('express');
const router = express.Router();
const GalleryItem = require('../models/GalleryItem');

router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const items = await GalleryItem.find(filter).sort({ sort_order: 1, createdAt: -1 }).lean();
    res.json({ data: items, total: items.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
