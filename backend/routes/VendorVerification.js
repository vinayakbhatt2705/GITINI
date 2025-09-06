const express = require('express');
const router = express.Router();
const VendorVerification = require('../models/VendorVerification');

// ✅ Mark vendor as verified
router.post('/verify/:profile_id', async (req, res) => {
  try {
    const { profile_id } = req.params;

    const verification = await VendorVerification.findOneAndUpdate(
      { profile_id: Number(profile_id) },
      { verified: true, verifiedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json(verification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get vendor verification status
router.get('/:profile_id', async (req, res) => {
  try {
    const verification = await VendorVerification.findOne({ profile_id: Number(req.params.profile_id) });
    res.json(verification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
