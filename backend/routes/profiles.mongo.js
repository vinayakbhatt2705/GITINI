const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile.mongo");
const User = require("../models/User.mongo");  // ✅ required to use User
// ➕ Create Profile
const { ObjectId } = require("mongodb");
const multer = require("multer");
//const Profile = require("../models/Profile");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });


// POST /profiles/add
router.post("/add", upload.single("photo"), async (req, res) => {
  try {
    console.log("Inside add profile route");

    // Find last numeric id
    const lastProfile = await Profile.findOne().sort({ id: -1 });
    const nextId = lastProfile ? lastProfile.id + 1 : 1;

    // Create new profile
    const profile = new Profile({
      id: nextId,
      name: req.body.name,
      address: req.body.address,
      age: Number(req.body.age),
      profession: req.body.profession,
      court_of_practice: req.body.court_of_practice,
      enrollment_no: req.body.enrollment_no,
      enrollment_year: Number(req.body.enrollment_year),
      photo_path: req.file ? "/uploads/" + req.file.filename : ""
    });

    await profile.save();
  // ✅ Create User linked to this profile
    const username = req.body.username || `user${nextId}`;  // default username
    const password = req.body.password || "admin1234";      // default password

    const user = new User({
      id: nextId,        // link user.id = profile.id
      username,
      password
    });

    await user.save();
    console.log("User created:", user);
    res.status(201).json({ id: nextId, message: "Profile created" });
  } catch (err) {
    console.error("Error saving profile:", err);
    res.status(400).json({ error: err.message });
  }
});

// 📃 Get All Profiles
router.get("/", async (req, res) => {
  try {
    console.log("inside profile mongo");
    const profiles = await Profile.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Get Profile by id
router.get("/:id", async (req, res) => {
  try {
    const profile = await Profile.findOne({ id: req.params.id });
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Update Profile
router.put("/:id", async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Delete Profile
router.delete("/:id", async (req, res) => {
  try {
    await Profile.findOneAndDelete({ id: req.params.id });
    res.json({ message: "Profile deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
