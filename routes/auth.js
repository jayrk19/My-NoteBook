const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const fetchUser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");

require("dotenv").config();

// ROUTE 1 : Create User
router.post(
  "/createUser",
  [
    body("name", "Enter a valid Name").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    try {
      let existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          message: "User with provided email already exists",
        });
      }
      const salt = await bcrypt.genSalt(10);
      const securePassword = await bcrypt.hash(req.body.password, salt);
      const user = await new User({
        name: req.body.name,
        email: req.body.email,
        password: securePassword,
      });
      const newUser = await user.save();

      const data = {
        user: {
          id: newUser.id,
        },
      };
      const authToken = jwt.sign(data, process.env.JWT_SECRET);
      res.status(200).json({ authToken });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error occurred, please try again later",
      });
    }
  }
);

//  ROUTE 2 : Authenticate User
router.post(
  "/login",
  [
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password must not be blank").exists(),
  ],
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          message: "Please try logging with correct credentials",
        });
      }

      const comparePassword = await bcrypt.compare(password, user.password);
      if (!comparePassword) {
        return res.status(400).json({
          message: "Please try logging with correct credentials",
        });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, process.env.JWT_SECRET);
      res.status(200).json({ authToken });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error occurred, please try again later",
      });
    }
  }
);

//  ROUTE 3 : Fetch details of user who logged in
router.post("/getUser", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error occurred, please try again later",
    });
  }
});

module.exports = router;
