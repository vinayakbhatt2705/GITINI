const jwt = require('jsonwebtoken');

const SECRET_KEY = "mysecret"; // ideally use process.env.SECRET_KEY

// Middleware: Verify JWT
function authenticateJWT(req, res, next) {
  console.log("reached auth jwt");
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "Token missing" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).send({ message: "Invalid token" });
    }
    req.user = user; // store decoded user info
    console.log("stored user:"+ req.user);
    next();
  });
}

// Middleware: Check role
function authenticateRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send({ message: "User not authenticated" });
    }
    if (req.user.role !== role) {
      return res.status(403).send({ message: "Access denied: insufficient role" });
    }
    next();
  };
}

module.exports = { authenticateJWT, authenticateRole };
