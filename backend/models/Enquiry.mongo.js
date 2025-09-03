const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema({
  enquiry_id: {
    type: Number,
    required: true,
    unique: true
  },
  profile_id: {
    type: Number,
    required: true
  },
  customer_name: {
    type: String,
    required: true,
    trim: true
  },
  customer_phone: {
    type: String,
    required: true,
    trim: true
  },
  customer_email_id: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  enquiry_date: {
    type: Date,
    default: Date.now
  }
}, {
  collection: "enquiries"
});

module.exports = mongoose.model("Enquiry", enquirySchema,"enquries");
