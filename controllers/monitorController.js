const Monitor = require("../models/Monitor");

// Create a new monitor
const createMonitor = async (req, res) => {
  try {
    const monitor = new Monitor({ ...req.body, user: req.user.id });
    await monitor.save();
    res.status(201).json(monitor);
  } catch (err) {
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

// Update a monitor
const updateMonitor = async (req, res) => {
  try {
    const monitor = await Monitor.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });
    res.json(monitor);
  } catch (err) {
    res.status(500).json({ message: "Failed to update monitor" });
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
  updateMonitor,
  deleteMonitor,
};
