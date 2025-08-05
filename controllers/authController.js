const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    console.log("📝 Registration attempt - Request body:", req.body);
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      console.log("❌ Missing fields:", {
        name: !!name,
        email: !!email,
        password: !!password,
      });
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET environment variable is missing");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username: name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res
      .status(201)
      .json({ token, user: { id: user._id, username: name, email } });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

const login = async (req, res) => {
  try {
    console.log("🔐 Login attempt - Request body:", req.body);
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.log("❌ Missing fields:", {
        email: !!email,
        password: !!password,
      });
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET environment variable is missing");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Get Me Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login, getMe };
