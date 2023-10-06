const jwt = require("jsonwebtoken");

require("dotenv").config();

const fetchUser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res
      .status(401)
      .json({ message: "Please authenticate using valid token" });
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Please authenticate using valid token" });
  }
};

module.exports = fetchUser;
