// models/VendorLocation.js
const mongoose = require('mongoose');

const vendorLocationSchema = new mongoose.Schema({
  profile_id: {
    type: Number,
    required: true,
    unique: true // one vendor -> one location
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  }
});

// Geo Index for location queries
vendorLocationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('VendorLocation', vendorLocationSchema);
