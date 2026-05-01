const User = require("../models/User");
const { generateToken } = require("../config/jwt");
const { validateSignup } = require("../utils/validators");

// POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const errors = validateSignup(name, email, password);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//for admin
const promoteToAdmin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const userToPromote = await User.findOne({ email });
    if (!userToPromote) {
      return res.status(404).json({ message: "User not found with that email" });
    }

    if (userToPromote.role === "admin") {
      return res.status(400).json({ message: "User is already an admin" });
    }

    userToPromote.role = "admin";
    await userToPromote.save();

    res.json({
      message: `${userToPromote.name} has been promoted to admin`,
      user: {
        _id: userToPromote._id,
        name: userToPromote.name,
        email: userToPromote.email,
        role: userToPromote.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// AFTER — just add promoteToAdmin
module.exports = { signup, login, getMe, promoteToAdmin };