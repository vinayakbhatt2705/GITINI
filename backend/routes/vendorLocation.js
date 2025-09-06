// routes/vendorLocation.js
const express = require('express');
const router = express.Router();
const VendorLocation = require('../models/VendorLocation');
const Profile = require('../models/Profile.mongo'); // your profile model

// Add/update vendor location
router.post('/add-location', async (req, res) => {
  try {
    const { profile_id, lat, lng } = req.body;

    console.log(req.body);

    if (!profile_id || !lat || !lng) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: "Invalid lat/lng values" });
    }

    const loc = await VendorLocation.findOneAndUpdate(
      { profile_id },
      {
        profile_id,
        location: { type: 'Point', coordinates: [longitude, latitude] }
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, location: loc });
  } catch (err) {
    console.error("Error in /add-location:", err);
    res.status(500).json({ error: err.message });
  }
});


// Search nearby vendors
// Search nearby profiles (vendors)
router.get('/near', async (req, res) => {
   console.log('location call:'+ req.query.lng);
    console.log('location call:'+ req.query.lat);
  const { lat, lng, radius,profession } = req.query;
  

  try {
    const locations = await VendorLocation.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius) // meters
        }
      }
    });
     console.log(locations);

  const profileIds = locations.map(l => l.profile_id);

   let profileFilter = { id: { $in: profileIds } };

if (profession) {
  profileFilter.profession = { $regex: `^${profession}$`, $options: "i" };
}

const profiles = await Profile.find(profileFilter);
 console.log(profiles);

    res.json({
      profiles,               // keep same key as normal profile search
      totalCount: profiles.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
