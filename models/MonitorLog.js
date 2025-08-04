const mongoose = require("mongoose");

const MonitorLogSchema = new mongoose.Schema({
  monitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Monitor",
    required: true,
  },
  status: {
    type: String,
    enum: ["up", "down"],
    required: true,
  },
  responseCode: {
    type: Number,
  },
  responseTime: {
    type: Number, // in ms
  },
  message: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MonitorLog", MonitorLogSchema);
