const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');

// ✅ Add a testimonial
router.post('/', async (req, res) => {
  try {
    const testimonial = new Testimonial(req.body);
    await testimonial.save();
    res.json({ success: true, testimonial });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all testimonials
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .populate('vendorId', 'name profession')
      .sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
