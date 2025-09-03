const express = require('express');
const router = express.Router();
const axios = require('axios');
const Profile = require('../models/Profile'); // your profiles collection

router.post('/send-sms', async (req, res) => {
  try {
    const { profile_id,  message } = req.body;

    // Fetch vendor phone from profiles collection
    const profile = await Profile.findOne({ profile_id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const vendorPhone = profile.phone;
    const vendorname=profile.name;

    // MSG91 credentials
    const authKey = 'YOUR_MSG91_AUTH_KEY';
    const senderId = 'SENDERID'; // 6 characters
    const route = 4; // transactional

    // MSG91 API payload
    const smsPayload = {
      sender: senderId,
      route: route.toString(),
      country: "91",
      mobiles: vendorPhone,
      message: `Message from ${customerName} (${customerPhone}): ${message}`
    };

    const response = await axios.post('https://api.msg91.com/api/v2/sendsms', smsPayload, {
      headers: {
        authkey: authKey,
        "Content-Type": "application/json"
      }
    });

    return res.json({ success: true, response: response.data });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to send SMS' });
  }
});

module.exports = router;
