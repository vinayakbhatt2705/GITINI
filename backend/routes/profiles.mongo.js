const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile.mongo");
const User = require("../models/User.mongo");  // ✅ required to use User
const PriorityList = require("../models/PriorityList");
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
/*router.get("/", async (req, res) => {
  try {
    console.log("inside profile mongo");
    const profiles = await Profile.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});*/

/* changed for priority setting
router.get("/", async (req, res) => {
  try {
    console.log("Inside get after filter backend");
    console.log(req.query.page + "  "+req.query.pageSize)
    let page = parseInt(req.query.page) || 1;
    let pageSize = parseInt(req.query.pageSize) || 20;
    let skip = (page - 1) * pageSize;
  
    const filter = {};
   if (req.query.profession) {
  filter.profession = { $regex: req.query.profession, $options: "i" };
}
if (req.query.court_of_practice) {
  filter.court_of_practice = { $regex: req.query.court_of_practice, $options: "i" };
}
    
// 🟢 Debug logging
    console.log("Incoming query params:", req.query);
    console.log("MongoDB filter object:", filter);
    console.log(`Pagination -> page: ${page}, pageSize: ${pageSize}, skip: ${skip}`);
    const profiles = await Profile.find(filter)
      .skip(skip) 
      .limit(pageSize)
      .lean();

    const totalCount = await Profile.countDocuments(filter);

    res.json({ profiles, totalCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});*/


router.get("/", async (req, res) => {
  try {
    console.log("Inside get after filter backend");
    console.log(req.query.page + "  " + req.query.pageSize);

    let page = parseInt(req.query.page) || 1;
    let pageSize = parseInt(req.query.pageSize) || 2;
    let skip = (page - 1) * pageSize;

    const filter = {};
    if (req.query.profession) {
      filter.profession = { $regex: req.query.profession, $options: "i" };
    }
    if (req.query.court_of_practice) {
      filter.court_of_practice = {
        $regex: req.query.court_of_practice,
        $options: "i",
      };
    }

    // 🟢 Debug logging
    console.log("Incoming query params:", req.query);
    console.log("MongoDB filter object:", filter);
    console.log(
      `Pagination -> page: ${page}, pageSize: ${pageSize}, skip: ${skip}`
    );

    // Priority mapping
    const priorityOrder = { A: 1, B: 2, C: 3, D: 4, E: 5 };

    // Aggregation to merge profiles + priority list
    const profiles = await Profile.aggregate([
      { $match: filter },

      // Lookup priority info
      {
        $lookup: {
          from: "prioritylists", // collection name
          localField: "id",
          foreignField: "profile_id",
          as: "priority",
        },
      },
      {
        $unwind: {
          path: "$priority",
          preserveNullAndEmptyArrays: true, // profiles without priority are still included
        },
      },

      // Exclude F (visibility false)
      {
        $match: {
          $or: [
            { "priority.cust_class": { $ne: "F" } },
            { priority: { $exists: false } }, // no priority → include
          ],
        },
      },

      // Add numeric sort value
      {
        $addFields: {
          sortPriority: {
            $switch: {
              branches: [
                { case: { $eq: ["$priority.cust_class", "A"] }, then: 1 },
                { case: { $eq: ["$priority.cust_class", "B"] }, then: 2 },
                { case: { $eq: ["$priority.cust_class", "C"] }, then: 3 },
                { case: { $eq: ["$priority.cust_class", "D"] }, then: 4 },
                { case: { $eq: ["$priority.cust_class", "E"] }, then: 5 },
              ],
              default: 999, // no priority
            },
          },
        },
      },

      // Sort by priority first, then createdAt (or name, etc.)
      { $sort: { sortPriority: 1, createdAt: -1 } },

      // Pagination
      { $skip: skip },
      { $limit: pageSize },
    ]);

    // Total count (excluding F)
    const totalCount = await Profile.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "prioritylists",
          localField: "id",
          foreignField: "profile_id",
          as: "priority",
        },
      },
      {
        $unwind: {
          path: "$priority",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [
            { "priority.cust_class": { $ne: "F" } },
            { priority: { $exists: false } },
          ],
        },
      },
      { $count: "total" },
    ]);

    res.json({
      profiles,
      totalCount: totalCount[0]?.total || 0,
    });
  } catch (err) {
    console.error("Error in GET /profiles:", err);
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
