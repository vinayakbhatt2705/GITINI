const mongoose = require('mongoose');

const VendorVerificationSchema = new mongoose.Schema({
  profile_id: {
    type: Number,  // ✅ numeric id instead of ObjectId
    required: true,
    unique: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  }
});

module.exports = mongoose.model('VendorVerification', VendorVerificationSchema);
