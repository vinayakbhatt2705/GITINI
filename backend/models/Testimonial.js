const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  type: { type: String, enum: ['ask', 'recommend', 'thank'], required: true },
  message: { type: String, required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', default: null },
  customerName: { type: String, default: 'Anonymous' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
