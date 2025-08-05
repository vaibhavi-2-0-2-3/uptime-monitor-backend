const mongoose = require("mongoose");

const MonitorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    frequency: {
      type: Number,
      default: 1, // in minutes
    },
    timeout: {
      type: Number,
      default: 5000, // in milliseconds
    },
    status: {
      type: String,
      enum: ["up", "down", "pending"],
      default: "pending",
    },
    lastCheckedAt: {
      type: Date,
    },
    isAlertSent: {
      type: Boolean,
      default: false,
    },
    uptime: {
      type: Number,
      default: 0, // percentage
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Monitor", MonitorSchema);
