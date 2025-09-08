// routes/priority.js
const express = require('express');
const router = express.Router();
const PriorityList = require('../models/PriorityList');

// Set or update priority
router.post('/set-priority', async (req, res) => {
  try {
    const { profile_id, cust_class } = req.body;

    const visibility = cust_class !== 'F'; // Hide if class F

    const updated = await PriorityList.findOneAndUpdate(
      { profile_id },
      { profile_id, cust_class, visibility },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;  // ✅ must export router