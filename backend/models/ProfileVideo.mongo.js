const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  profile_id: {
    type: Number,
    required: true
  },
  video_url: {
    type: String,
    required: true,
    trim: true
  },
  uploaded_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: "videos"
});

module.exports = mongoose.model("Video", videoSchema, "profilevideos");
