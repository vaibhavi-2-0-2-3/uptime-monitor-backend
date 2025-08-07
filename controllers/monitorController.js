const Monitor = require("../models/Monitor");

// Create a new monitor
const createMonitor = async (req, res) => {
  try {
    const { url } = req.body;

    // Validate URL
    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    // Extract name from URL if not provided
    const urlObj = new URL(url);
    const name = urlObj.hostname || url;

    const monitor = new Monitor({
      url,
      name,
      user: req.user.id,
      status: "pending", // Initial status
      uptime: 0, // Initial uptime
    });
    await monitor.save();
    res.status(201).json(monitor);
  } catch (err) {
    console.error("Create Monitor Error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid URL format" });
    }
    res
      .status(500)
      .json({ message: "Failed to create monitor", error: err.message });
  }
};

// Get all monitors for the logged-in user
const getUserMonitors = async (req, res) => {
  try {
    const monitors = await Monitor.find({ user: req.user.id });
    res.json(monitors);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch monitors" });
  }
};

// Update a monitor (edit name/url)
const editMonitor = async (req, res) => {
  try {
    const { name, url } = req.body;
    const update = {};
    if (name) update.name = name;
    if (url) {
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ message: "Invalid URL format" });
      }
      update.url = url;
    }
    if (!name && !url) {
      return res.status(400).json({ message: "Nothing to update" });
    }
    const monitor = await Monitor.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      update,
      { new: true }
    );
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });
    res.json(monitor);
  } catch (err) {
    res.status(500).json({ message: "Failed to update monitor" });
  }
};

// Pause/resume a monitor
const togglePauseMonitor = async (req, res) => {
  try {
    const monitor = await Monitor.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });
    monitor.isPaused = !monitor.isPaused;
    await monitor.save();
    res.json(monitor);
  } catch (err) {
    res.status(500).json({ message: "Failed to pause/resume monitor" });
  }
};

// Delete a monitor
const deleteMonitor = async (req, res) => {
  try {
    const monitor = await Monitor.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });
    res.json({ message: "Monitor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete monitor" });
  }
};

module.exports = {
  createMonitor,
  getUserMonitors,
  editMonitor,
  togglePauseMonitor,
  deleteMonitor,
};
