const mongoose = require("mongoose");

const PriorityListSchema = new mongoose.Schema({
  profile_id: { type: Number, required: true },   // 🔥 Number instead of String
  cust_class: { type: String, enum: ["A", "B", "C", "D", "E", "F"], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PriorityList", PriorityListSchema);
