const express = require("express");
const router = express.Router();
const path = require("path");
const Video = require("../models/ProfileVideo.mongo");
const multer = require("multer");
//const Profile = require("../models/Profile");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /mp4|mov|avi|mkv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb("Error: Videos only!");
  },
});



// ➕ Create Video
// helper to generate incremental id
async function getNextId() {
  const lastVideo = await Video.findOne().sort({ id: -1 });
  return lastVideo ? lastVideo.id + 1 : 1;
}

// upload API
router.post("/add", upload.single("video"), async (req, res) => {
  
  try {
  
    console.log("profile_id"+ req.params.profile_id);
      const profile_id = parseInt(req.body.profile_id);
    const videoPath = "/uploads/videos/" + req.file.filename;

    const nextId = await getNextId();

    const video = new Video({
      id: nextId,
      profile_id,
      video_url: videoPath,
    }); await video.save();

    res.json({
      success: true,
      id: video.id,
      profile_id: video.profile_id,
      video_url: video.video_url,
      uploaded_at: video.uploaded_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});
// 📃 Get All Videos
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Get Video by id
router.get("/:profile_id", async (req, res) => {
  try {
    console.log("inside fetch video by profile_id");
    console.log(req.params.profile_id);
    const video = await Video.findOne({ profile_id:Number( req.params.profile_id) });
    console.log("video:" +video.profile_id, typeof video.profile_id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } 
});

// ✏️ Update Video
router.put("/:id", async (req, res) => {
  try {
    const video = await Video.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(video);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Delete Video
router.delete("/:id", async (req, res) => {
  try {
    await Video.findOneAndDelete({ id: req.params.id });
    res.json({ message: "Video deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
