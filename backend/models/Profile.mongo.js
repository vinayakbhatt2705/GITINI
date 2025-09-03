const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  age: {
    type: Number,
    required: false
  },
  profession: {
    type: String,
    required: false
  },
  court_of_practice: {
    type: String,
    required: false
  },
  enrollment_no: {
    type: String,
    unique: true,
    sparse: true // allows null values while keeping uniqueness
  },
  enrollment_year: {
    type: Number,
    required: false
  },
  photo_path: {
    type: String,
    required: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: "profiles"
});

module.exports = mongoose.model("Profile", profileSchema, "profiles");
