const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');

router.get('/', async (req, res, next) => {
  try {
    const { lang = 'en', category, popular, available = 'true' } = req.query;
    const filter = {};
    if (available !== 'all') filter.is_available = available !== 'false';
    if (category) filter.category = category;
    if (popular === 'true') filter.is_popular = true;

    const items = await MenuItem.find(filter).sort({ sort_order: 1, createdAt: -1 }).lean();
    const result = items.map((item) => ({
      id: item._id,
      name: item.name?.[lang] || item.name?.en || item.name?.hy || '',
      name_hy: item.name?.hy || '',
      description: item.description?.[lang] || item.description?.en || '',
      price: item.price,
      category: item.category,
      image_url: item.image_url,
      is_available: item.is_available,
      is_popular: item.is_popular,
      tags: item.tags,
    }));
    res.json({ data: result, total: result.length });
  } catch (err) {
    next(err);
  }
});

router.get('/item/:id', async (req, res, next) => {
  try {
    const { lang = 'en' } = req.query;
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Not found' });
    }
    const item = await MenuItem.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({
      data: {
        id: item._id,
        name: item.name?.[lang] || item.name?.en || item.name?.hy || '',
        name_hy: item.name?.hy || '',
        name_en: item.name?.en || '',
        name_ru: item.name?.ru || '',
        description: item.description?.[lang] || item.description?.en || '',
        description_hy: item.description?.hy || '',
        description_en: item.description?.en || '',
        price: item.price,
        category: item.category,
        image_url: item.image_url,
        is_available: item.is_available,
        is_popular: item.is_popular,
        tags: item.tags || [],
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    const { lang = 'en' } = req.query;
    const cats = await Category.find({ is_active: true }).sort({ sort_order: 1 }).lean();
    const result = cats.map((c) => ({
      slug: c.slug,
      name: c.name?.[lang] || c.name?.en || c.slug,
      icon: c.icon,
    }));
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

router.get('/:category', async (req, res, next) => {
  try {
    const { lang = 'en' } = req.query;
    const items = await MenuItem.find({
      category: req.params.category,
      is_available: true,
    }).sort({ sort_order: 1 }).lean();

    const result = items.map((item) => ({
      id: item._id,
      name: item.name?.[lang] || item.name?.en || '',
      description: item.description?.[lang] || item.description?.en || '',
      price: item.price,
      category: item.category,
      image_url: item.image_url,
      is_popular: item.is_popular,
      tags: item.tags,
    }));
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
