const mongoose = require("mongoose");
const MonitorLog = require("../models/MonitorLog");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/uptime-monitor"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const generateSampleData = async () => {
  try {
    // Get the first monitor (assuming it exists)
    const Monitor = require("../models/Monitor");
    const monitor = await Monitor.findOne();

    if (!monitor) {
      console.log("No monitors found. Please create a monitor first.");
      return;
    }

    console.log(`Generating sample data for monitor: ${monitor.name}`);

    // Generate data for the last 24 hours
    const now = new Date();
    const dataPoints = [];

    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000); // Each hour

      // Generate 60 data points per hour (every minute)
      for (let j = 0; j < 60; j++) {
        const minuteTimestamp = new Date(timestamp.getTime() + j * 60 * 1000);

        // Generate realistic response times with some variation
        const baseResponseTime = 100 + Math.random() * 50; // 100-150ms base
        const variation = (Math.random() - 0.5) * 40; // ±20ms variation
        const responseTime = Math.max(
          50,
          Math.round(baseResponseTime + variation)
        );

        // 95% uptime, 5% downtime
        const status = Math.random() > 0.05 ? "UP" : "DOWN";

        dataPoints.push({
          monitorId: monitor._id,
          timestamp: minuteTimestamp,
          status,
          responseTime: status === "UP" ? responseTime : 0,
        });
      }
    }

    // Insert the data
    await MonitorLog.insertMany(dataPoints);

    console.log(`✅ Generated ${dataPoints.length} sample data points`);
    console.log(`📊 Data spans the last 24 hours`);
    console.log(`📈 Response times range from ~50ms to ~200ms`);
    console.log(`🟢 ~95% uptime, ~5% downtime`);
  } catch (error) {
    console.error("Error generating sample data:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
generateSampleData();
