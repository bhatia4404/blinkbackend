const JWT_SECRET_KEY = require("../config");
const jwt = require("jsonwebtoken");
function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization;
    const { email } = jwt.verify(token, JWT_SECRET_KEY);

    req.email = email;
    next();
  } catch (e) {
    res.json({
      message: "Unauthorized request",
    });
  }
}

module.exports = { authMiddleware };
