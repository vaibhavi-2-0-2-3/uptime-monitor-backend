const Monitor = require("../models/Monitor");
const MonitorLog = require("../models/MonitorLog");

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

// Analytics: Get logs for a monitor
const getMonitorLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { range = "24h" } = req.query;
    const userId = req.user.id;
    // Validate monitor ownership
    const monitor = await Monitor.findOne({ _id: id, user: userId });
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });

    let since = new Date();
    if (range === "7d") {
      since.setDate(since.getDate() - 7);
    } else {
      since.setHours(since.getHours() - 24);
    }

    // Only fetch up to 1000 logs for performance
    const logs = await MonitorLog.find({
      monitorId: id,
      timestamp: { $gte: since },
    })
      .sort({ timestamp: 1 })
      .limit(1000)
      .lean();

    const total = logs.length;
    const upCount = logs.filter((l) => l.status === "UP").length;
    const downCount = logs.filter((l) => l.status === "DOWN").length;
    const uptime = total > 0 ? (upCount / total) * 100 : 0;
    const avgResponse =
      total > 0
        ? Math.round(
            logs.reduce((sum, l) => sum + (l.responseTime || 0), 0) / total
          )
        : 0;

    res.json({
      logs: logs.map((l) => ({
        timestamp: l.timestamp,
        status: l.status,
        responseTime: l.responseTime,
      })),
      uptime: Math.round(uptime * 10) / 10,
      downtimeCount: downCount,
      avgResponseTime: avgResponse,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch monitor logs" });
  }
};

module.exports = {
  createMonitor,
  getUserMonitors,
  editMonitor,
  togglePauseMonitor,
  deleteMonitor,
  getMonitorLogs,
};
