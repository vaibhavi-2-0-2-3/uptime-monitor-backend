const express = require("express");
const {
  createMonitor,
  getUserMonitors,
  updateMonitor,
  deleteMonitor,
} = require("../controllers/monitorController");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const sendEmail = require("../utils/email");

const router = express.Router();

// All monitor routes are protected
router.use(authMiddleware);

router.post("/", createMonitor); // POST /api/monitors
router.get("/", getUserMonitors); // GET /api/monitors
router.put("/:id", updateMonitor); // PUT /api/monitors/:id
router.delete("/:id", deleteMonitor); // DELETE /api/monitors/:id
router.post("/test-email", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.email) {
      return res.status(400).json({ message: "User email not found" });
    }

    const subject = "🧪 Test Email from Uptime Monitor";
    const text = `This is a test email to verify email functionality.\n\nUser: ${
      user.username
    }\nEmail: ${user.email}\nTime: ${new Date().toLocaleString()}`;

    await sendEmail(user.email, subject, text);
    res.json({ message: "Test email sent successfully" });
  } catch (error) {
    console.error("Test email error:", error);
    res
      .status(500)
      .json({ message: "Failed to send test email", error: error.message });
  }
});

module.exports = router;
