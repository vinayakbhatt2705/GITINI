require('dotenv').config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const vendorLocationRoutes = require('./routes/vendorLocation');

const profileRoutes = require("./routes/profiles.mongo");
const userRoutes = require("./routes/users.mongo.js");
const enquiryRoutes = require("./routes/enquiries.mongo");
const videoRoutes = require("./routes/videos.mongo");
const profilesadd = require("./routes/profiles.add.mongo.js");
const testimonialsRoute = require('./routes/testimonials');



const app = express();
const PORT = process.env.PORT || 4500;

const jwt = require("jsonwebtoken");
const { authenticateJWT, authenticateRole } = require("./routes/auth.js");
const User = require("./models/User.mongo.js"); // mongoose model for users

const SECRET_KEY = "mysecret";






// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
//app.use('/sms', smsRoutes);



// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB Database"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Routes
app.use('/testimonials', testimonialsRoute);
app.use('/vendors-location', vendorLocationRoutes);
app.use("/profiles", profileRoutes);
app.use("/users", userRoutes);
app.use("/enquiries", enquiryRoutes);
app.use("/videos", videoRoutes);
app.use("/profiles/add", profilesadd);

app.post("/login", async (req, res) => {


  try {
    const { username, password } = req.body;
      console.log("req"+ username);
      console.log("req"+ password);
    const user = await User.findOne({ username });

    console.log("user mongo"+user);

    if (!user) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    if (password !== user.password) {
      return res.status(401).send({ message: "Invalid credentials" });
    }
  console.log("reached token call");
const token = jwt.sign(
  { id: user.id, role: user.role }, // use _id instead of id for Mongo
  SECRET_KEY,
  { expiresIn: "2h" }
);

console.log("Generated token:", token);

    res.send({ token, role: user.role, id: user.id });
  } catch (err) {
    res.status(500).send({ message: "Server error", error: err.message });
  }
});




app.use(express.static(path.join(__dirname, 'dist/frontend')));

// catch-all for Angular routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/frontend/index.html'));
});

app.listen(process.env.PORT, () => {
  console.log('Server running at' + process.env.MONGO_URI);
});
/*Start server*/
//const PORT = 3000;
/*app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});*/
