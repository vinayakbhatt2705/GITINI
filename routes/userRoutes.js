const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/users/:userId
router.get("/:userId", async(req, res) => {
  try { 
  const userId = req.params.userId;
 console.log(userId);
  const sql = `
    SELECT 
      u.id ,
      u.username,
      p.id AS profile_id,
      p.name ,
      p.profession,
      e.enquiry_id,
      e.customer_Name,
      e.customer_Phone,
      e.customer_Email_Id,
      e.Question,
      e.enquiry_date
    FROM users u
    INNER JOIN profiles p ON u.id = p.id
    LEFT JOIN enquiries e ON p.id = e.profile_id
    WHERE u.id = ?;
  `;

 const [result]= await db.query(sql, [userId]);
   
    res.json({result});
    } catch (err) {
    console.error("Error fetching profiles:", err);
    res.status(500).send({ error: err.message });
  }
  });


module.exports = router;
