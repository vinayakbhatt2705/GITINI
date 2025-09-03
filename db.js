// backend/db.js
const mysql = require("mysql2/promise");
const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",        // ⚡ change to your MySQL username
  password: "root",// ⚡ change to your MySQL password
  database: "lawyer_portal"
});


module.exports = db;
