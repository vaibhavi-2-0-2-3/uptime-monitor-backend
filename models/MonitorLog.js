const mongoose = require("mongoose");

const MonitorLogSchema = new mongoose.Schema({
  monitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Monitor",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  status: {
    type: String,
    enum: ["UP", "DOWN"],
    required: true,
  },
  responseTime: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("MonitorLog", MonitorLogSchema);
