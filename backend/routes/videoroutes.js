const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../db"); // your MySQL connection
const { Console } = require("console");
const router = express.Router();


// Configure storage for videos
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

// Upload video API
router.post("/videos", upload.single("video"), (req, res) => {
  const videoPath = "/uploads/videos/" + req.file.filename;
  const profile_id=req.body.profile_id;   
  console.log(profile_id);
  db.query(
    "INSERT INTO profile_videos (profile_id,video_url) VALUES (?,?)",
    [profile_id,videoPath],
    (err, result) => {
          result.send({ id: result.id });
      if (err) return res.status(500).send(err);
      res.json({ success: true, videoUrl: videoPath });
    }
  );
});

// Get all videos
router.get("", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM profile_videos");
    res.json(rows);
  } catch (err) {
    res.status(500).send(err);
  }
});

/*router.get("/uploads/:profileId", (req, res) => {
  const { profileId } = req.params;
  console.log("in upload video");
  db.query(
    "SELECT video_url FROM profile_videos WHERE profile_id = ? LIMIT 1",
    [profileId],
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.length === 0) return res.status(404).send("No video found");
      res.send(result);
    }
  );*/


/* router.get('/uploads/:profile_id', async (req, res) => {
  try {
console.log("right");
    console.log(req.params.profile_id);
    const [rows] = await db.query(
      'SELECT video_url FROM profile_videos WHERE profile_id = ?',
      [req.params.profile_id]
    );
    if (rows.length === 0) return res.  status(404).send('Video not found');

    // build absolute path
    const videoPath = path.join(__dirname, rows[0].video_url);
    res.json({ video_url: result[0].video_url });
  } catch (err) {
    res.status(500).send(err);
  }
});*/

/*router.get("/uploads/:profile_id", (req, res) => {
  try {
    const profile_id = req.params.profile_id;
    console.log("Request video profile_id:", profile_id);

    const result =db.query("SELECT video_url FROM profile_videos WHERE profile_id = ?", [profile_id], (err, rows) => {
      if (err) {
        console.error("DB error:", err  );
        return res.status(500).send("DB error");
      }

      if (rows.length === 0) {
        console.log("No video found for profile_id:", profile_id);
        return res.status(404).send("No video found");
      }
      console.log("DB rows:", rows);
      console.log("First row video_url:", rows[0]?.video_url);

      //console.log("Sending video URL:", rows[0].video_url);
      res.json({ video_url: result.video_url });
    });
  } catch (e) {
    console.error("Unexpected backend error:", e);
    res.status(500).send("Server error");
  }
});*/

router.get("/videos/:profile_id", async (req, res) => {
  try {
    const profile_id = req.params.profile_id;
    console.log(profile_id);
    //const [rows] = await db.query("SELECT * FROM profile_videos");
    const [rows]  =await db.query("SELECT video_url FROM profile_videos WHERE profile_id = ?", [profile_id]);
   console.log("rows:"+rows);
     res.json({ video_url: rows[0].video_url });
  } catch (err) {
    res.status(500).send(err);
  }
});




module.exports = router;
