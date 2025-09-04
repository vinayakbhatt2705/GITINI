const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require('jsonwebtoken');
const SECRET_KEY = "mysecret"; 
const db = require('../db');
const { authenticateJWT, authenticateRole } = require('./auth');
// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1E9) + ext);
  },
});

const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

// Create profile
router.post("/profiles", upload.single("photo"), async (req, res) => {
  try {
    const {
      name,
      address,
      age,
      profession,
      court_of_practice,
      enrollment_no,
      enrollment_year,
    } = req.body;

    if (!req.file) return res.status(400).json({ error: "Photo required" });

    const [result] = db.query(
      `INSERT INTO profiles 
      (name,address,age,profession,court_of_practice,enrollment_no,enrollment_year,photo_path) 
      VALUES (?,?,?,?,?,?,?,?)`,
      [
        name,
        address,
        age,
        profession,
        court_of_practice,
        enrollment_no,
        enrollment_year,
        "/uploads/" + req.file.filename,
      ]
    );
    res.json({ id: result.insertId, message: "Profile created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all profiles
router.get("/profiles", async (req, res) => {
  try {

    console.log("I am in get");
    const [rows] = db.query("SELECT * FROM profiles ORDER BY created_at DESC");
    res.json(rows);
   // console.log(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

  // backend/routes/profileRoutes.js

// Update profile
router.put("/:id", upload.single("photo"), async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      address,
      age,
      profession,
      court_of_practice,
      enrollment_no,
      enrollment_year,
    } = req.body;

    let sql = `UPDATE profiles SET name=?, address=?, age=?, profession=?, court_of_practice=?, enrollment_no=?, enrollment_year=?`;
    const params = [name, address, age, profession, court_of_practice, enrollment_no, enrollment_year];

    if (req.file) {
      sql += `, photo_path=?`;
      params.push("/uploads/" + req.file.filename);
    }

    sql += ` WHERE id=?`;
    params.push(id);

    await pool.query(sql, params);
    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete profile
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query("DELETE FROM profiles WHERE id=?", [id]);
    res.json({ message: "Profile deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

});


router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    const user = { id: 1, role: "admin" };

     const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    console.log("Generated token:", token);
    res.json({ token, role: user.role });   
    //res.json({ success: true, message: "Login successful" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});
/*router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).send({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    const user = results[0];

    // ⚠️ use bcrypt.compare() in production
    if (password !== user.password) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    // create token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    res.send({ token, role: user.role });
  });
});*/

router.get('/profile', (req, res) => {
  console.log("I am in get api profiles");
  const search = req.query.q || '';
  console.log("search"+search);
 // const page = parseInt(req.query.page) || 1;
//  const limit = parseInt(req.query.limit) || 5;
const page=1;
const limit=5;
  const offset = (page - 1) * limit;

  let where = '';
  let params = [];

  if (search) {
    where = `WHERE name LIKE ? `;
    const term = `%${search}%`;
    params = [term ];
  }

  const sql = `SELECT * FROM profiles ${where}`;
  console.log(sql);
  const countSql = `SELECT COUNT(*) as total FROM profiles ${where}`;

  pool.query(countSql, params, (err, countResult) => {
    if (err) return res.status(500).send(err);
console.log('response'+res.status);
    pool.query(sql, [...params], (err, result) => {
      if (err) return res.status(500).send(err);
  
      res.send({
        data: result,
        total: countResult[0].total
       // page,
       // limit
      });
    });
  });
});

module.exports = router;
