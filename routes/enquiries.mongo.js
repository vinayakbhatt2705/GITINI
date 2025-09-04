const express = require("express");
const router = express.Router();
const Enquiry = require("../models/Enquiry.mongo");


// ➕ Create Enquiry
router.post("/", async (req, res) => {
  try {
    console.log("inside enquiries");
        // Find last enquiry_id
    const lastEnquiry = await Enquiry.findOne().sort({ enquiry_id: -1 });
    const enquiry_id = lastEnquiry ? lastEnquiry.enquiry_id + 1 : 1;
     const enquiry = new Enquiry({
      enquiry_id:enquiry_id,
      profile_id: Number(req.body.profile_id),
      customer_name: req.body.customer_name,
      customer_phone: req.body.customer_phone,
      customer_email_id: req.body.customer_email_id,
      question: req.body.question,
      enquiry_date: req.body.enquiry_date
    });
   //     console.log("DB object:", db);  // should not be undefined
   console.log("Enquiry to insert:", enquiry);
     console.log("REQ BODY:", req.body);
   // const enquiry = new Enquiry(req.body);

    
   // Optional: generate auto-incremented enquiry_id
    

   // const result = await db.collection("enquries").insertOne(enquiry);
    await enquiry.save();
   
    res.status(201).json(enquiry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📃 Get All Enquiries
router.get("/", async (req, res) => {
  try {
    const enquiries = await Enquiry.find();
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Get Enquiry by id
router.get("/:id", async (req, res) => {
  try {
    const enquiry = await Enquiry.findOne({ enquiry_id: req.params.id });
    if (!enquiry) return res.status(404).json({ error: "Enquiry not found" });
    res.json(enquiry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Update Enquiry
router.put("/:id", async (req, res) => {
  try {
    const enquiry = await Enquiry.findOneAndUpdate(
      { enquiry_id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(enquiry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Delete Enquiry
router.delete("/:id", async (req, res) => {
  try {
    await Enquiry.findOneAndDelete({ enquiry_id: req.params.id });
    res.json({ message: "Enquiry deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
