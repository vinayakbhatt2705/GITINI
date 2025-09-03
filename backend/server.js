  const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require("multer");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
const path = require("path");
const fs = require("fs");
const videoRoutes = require("./routes/videoroutes");
const profileRoutes = require('../backend/routes/profileRoutes');
const userRoutes = require("./routes/userRoutes");
const app = express();
const { authenticateJWT } = require('./routes/auth');
app.use(cors());
app.use("/users", userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/uploads", videoRoutes);
//app.use(bodyParser.json());
// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1E9) + ext);
  },
});

const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

const SECRET_KEY = "mysecretkey"; // 👈 keep safe in env file
app.use(cors());               // allow frontend requests
app.use(express.json());        // built-in body parser for JSON
app.use(express.urlencoded({ extended: true })); // for form submissions
//app.use(express.urlencoded({ extended: true })); // <-- needed if you send form-data
//app.use('/api', profileRoutes);

// 🔑 Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("inside login " + password);

    // query with promise
    const [results] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (results.length === 0) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    const user = results[0];
    console.log("result", results);

    // compare password (plaintext for demo — use bcrypt in real apps)
    if (password !== user.password) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    console.log("reached here near token");
    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET_KEY,
      { expiresIn: '2h' }
    );
   console.log(token);
    res.send({ token, role: user.role, id:user.id });

  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server error', error: err });
  }
});

// 🔒 Middleware for protecting routes*/
function authenticateRole(roles = []) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).send({ message: 'No token' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) return res.status(403).send({ message: 'Invalid token' });
      if (!roles.includes(decoded.role)) {
        return res.status(403).send({ message: 'Forbidden' });
      }
      req.user = decoded;
      next();
    });
  };
}

// 🟢 Public (everyone can view) call back
/*app.get('/api/profiles', (req, res) => {
  db.query('SELECT * FROM profiles', (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});*/

app.get('/api/profiles', async (req, res) => {
  try { 
    const [rows] = await db.query('SELECT * FROM profiles');  // ✅ destructure
    const profiles = rows.map(profile => ({
      ...profile,
      photoUrl: profile.photo ? `http://localhost:3000/uploads/${profile.photo}` : null
    }));
    res.json(profiles);  // ✅ send profiles, not rows
  } catch (err) {
    console.error("Error fetching profiles:", err);
    res.status(500).send({ error: err.message });
  }
});
/*app.get('/api/profiles', async (req, res) => {
  try {
    console.log("in get");
    const [rows] = await db.query('SELECT * FROM profiles');
    res.json(rows);
  } catch (err) {
    res.status(500).send(err);
  }
});*/

// 🔴 Admin-only routes
app.post("/api/profiles", upload.single("photo"), async (req, res) => {
  try {
    console.log("inside save");
    const {
      name,
      address,
      age,
      profession,
      court_of_practice,
      enrollment_no,
      enrollment_year,
    } = req.body;
const photo ="/uploads/" +(req.file ? req.file.filename : null);

    if (!req.file) return res.status(400).json({ error: "Photo required" });
    

     

      const [profileResult] =await db.query(
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
       // "/uploads/" + req.file.filename,
       photo
      ]
    );

    const profileId = profileResult.insertId; // use same id as profile_id
     console.log(profileId);

     const [userResult] = await db.query(
      `INSERT INTO users (id,username, password, role) VALUES (?, ?, ?,?)`,
      [profileId,name, 'admin1234', 'user']
    );
    console.log("user:" + profileId);
     res.json({ id:profileId });
     //  res.send({ id: result.insertId, photoUrl: `/uploads/${photo}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.put('/api/profiles/:id', authenticateRole(['admin']), (req, res) => {
  const { id } = req.params;
  const { name, address, age, profession, court, enrollmentNo, enrollmentYear, photo } = req.body;
  db.query(
    'UPDATE profiles SET name=?, address=?, age=?, profession=?, court=?, enrollmentNo=?, enrollmentYear=?, photo=? WHERE id=?',
    [name, address, age, profession, court, enrollmentNo, enrollmentYear, photo, id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({ success: true });
    }
  );
});
function formatDateToMySQL(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}
app.post('/api/enquiries', (req, res) => {
  const { profileId, customerName, customerPhone, customerEmailId, profileQuestion, enquiryDate } = req.body;
//enquiryDate=formatDateToMySQL(enquiryDate);
  const sql = `
    INSERT INTO enquiries 
    (profile_id, customer_name, customer_phone, customer_email_id, question) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [profileId, customerName, customerPhone, customerEmailId, profileQuestion], (err, result) => {
    if (err) {
      console.error('DB insert error:', err);
      return res.status(500).json({ error: 'Failed to save enquiry' });
    }
    res.status(201).json({ message: 'Enquiry saved successfully', enquiryId: result.insertId });
  });
});




app.delete('/api/profiles/:id', authenticateRole(['admin']), (req, res) => {
  db.query('DELETE FROM profiles WHERE id=?', [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ success: true });
  });
});
app.listen(3000,'0.0.0.0' );
// Start server

