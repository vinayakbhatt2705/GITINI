const express = require("express");
const router = express.Router();
const User = require("../models/User.mongo");       // users collection
const Profile = require("../models/Profile.mongo"); // profiles collection
const Enquiry = require("../models/Enquiry.mongo"); // enquries collection

// GET /users/:userId
router.get("/:userId", async (req, res) => {
  try {

    console.log("from fetch");
    const userId = Number(req.params.userId);
    console.log("from fetch userid :" + userId);
   /* const result = await User.aggregate([
      { $match: { id: userId } }, // filter user

      // join with profiles
      {
        $lookup: {
          from: "profiles",
          localField: "id",
          foreignField: "id",
          as: "profiles"
        }
      },
      { $unwind: "$profiles" },

      // join with enquries
      {
        $lookup: {
          from: "enquries",
          localField: "enquries.id",   // profile.id in profiles
          foreignField: "profile_id", // profile_id in enquries
          as: "enquries"
        }
      }
    ]);*/



/*   const result = await User.aggregate([
  { $match: { id: parseInt(4) } },
{
    $lookup: {
      from: "enquries",
      localField: "id",   // profile.id
      foreignField: "profile_id",  // enquries.profile_id
      as: "enquries"
    }
  },
 { $unwind: "$enquries" },
  // Join with profiles
  {
    $lookup: {
      from: "profiles",
      localField: "enquries.profile_id",
      foreignField: "id",
      as: "enquries.profiles"
    }
  },
 

  // Join enquries with profile


  // ✅ Project without breaking the array
  {
    $project: {
      _id: 0,
      id: 1,
      username: 1,
      profile: {
        id: "$enquries.profile_id",
        name: "$enquries.customer_name",

        profession: "$profiles.profession",
        profiles: "$enquries.profiles"   // keep arra as-is
      }
    }
  }
]);*/



const result = await await User.aggregate([
  { $match: { id: userId } },   // WHERE u.id = ?

  // INNER JOIN profiles
  {
    $lookup: {
      from: "profiles",
      localField: "id",   // users.id
      foreignField: "id", // profiles.id
      as: "profile"
    }
  },
  { $unwind: "$profile" },  // inner join → profile must exist

  // LEFT JOIN enquries
  {
    $lookup: {
      from: "enquries",
      localField: "profile.id",     // profiles.id
      foreignField: "profile_id",   // enquries.profile_id
      as: "enquiry"
    }
  },
  { $unwind: { path: "$enquiry", preserveNullAndEmptyArrays: true } },

  // Final projection (flatten fields)
  {
    $project: {
      _id: 0,
      id: 1,                        // u.id
      username: 1,                  // u.username
      "profile_id": "$profile.id",  // p.id
      "profile_name": "$profile.name",
      "profession": "$profile.profession",
      "enquiry_id": "$enquiry.enquiry_id",
      "customer_name": "$enquiry.customer_name",
      "customer_phone": "$enquiry.customer_phone",
      "customer_email_id": "$enquiry.customer_email_id",
      "question": "$enquiry.question",
      "enquiry_date": "$enquiry.enquiry_date"
    }
  }
]);
    if (!result || result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

     console.log(JSON.stringify(result, null, 2));
    res.json({result}); // return single user with profile & enquries
  } catch (err) {
    console.error("Error fetching profiles:", err);
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
