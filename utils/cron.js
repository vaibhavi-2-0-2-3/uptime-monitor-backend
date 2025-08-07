const cron = require("node-cron");
const axios = require("axios");
const Monitor = require("../models/Monitor");
const MonitorLog = require("../models/MonitorLog");
const User = require("../models/User");
const sendEmail = require("./email");

const checkUptime = async () => {
  try {
    const monitors = await Monitor.find();

    await Promise.all(
      monitors.map(async (monitor) => {
        if (monitor.isPaused) {
          console.log(`⏸️ Skipping paused monitor: ${monitor.name}`);
          return;
        }
        const start = Date.now();
        let status = "DOWN";
        let responseCode = null;
        let responseTime = null;
        let message = "";

        try {
          const res = await axios.get(monitor.url, {
            timeout: monitor.timeout || 5000,
          });
          responseCode = res.status;
          responseTime = Date.now() - start;

          if (res.status >= 200 && res.status < 300) {
            status = "UP";
            message = "OK";
          } else {
            message = `Unexpected status code: ${res.status}`;
          }
        } catch (err) {
          message = err.message || "Request failed";
          responseTime = Date.now() - start;
        }

        // Store analytics log
        await MonitorLog.create({
          monitorId: monitor._id,
          timestamp: new Date(),
          status,
          responseTime,
        });

        // Calculate uptime percentage from recent logs
        const recentLogs = await MonitorLog.find({
          monitorId: monitor._id,
          timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
        })
          .sort({ timestamp: -1 })
          .limit(1440); // Max 1440 checks (24 hours * 60 minutes)

        const totalChecks = recentLogs.length;
        const upChecks = recentLogs.filter((log) => log.status === "UP").length;
        const uptimePercentage =
          totalChecks > 0 ? (upChecks / totalChecks) * 100 : 0;

        // Store the old status before updating
        const oldStatus = monitor.status;

        // Update monitor status and uptime
        monitor.status = status.toLowerCase();
        monitor.lastCheckedAt = new Date();
        monitor.uptime = Math.round(uptimePercentage * 100) / 100; // Round to 2 decimal places

        // Handle alerts for status changes
        const statusChanged = oldStatus !== monitor.status;
        const shouldSendAlert =
          monitor.status === "down" && (!monitor.isAlertSent || statusChanged);

        if (shouldSendAlert) {
          console.log(
            `🔔 Alert condition met for ${monitor.name}: status=${monitor.status}, isAlertSent=${monitor.isAlertSent}, statusChanged=${statusChanged}`
          );

          const user = await User.findById(monitor.user);
          if (user && user.email) {
            const subject = `🚨 [${monitor.status.toUpperCase()}] ${
              monitor.name
            }`;
            const msg = `Monitor: ${monitor.name}\nURL: ${
              monitor.url
            }\nStatus: ${monitor.status.toUpperCase()}\nChecked at: ${new Date().toLocaleString()}`;
            console.log("🔔 Sending alert to:", user.email);

            try {
              await sendEmail(user.email, subject, msg);
              monitor.isAlertSent = true; // Mark alert as sent
              console.log(`✅ Alert sent successfully to ${user.email}`);
            } catch (emailError) {
              console.error("❌ Failed to send email alert:", emailError);
              monitor.isAlertSent = false; // Keep alert unsent for retry
            }
          } else {
            console.log(
              `⚠️ No user or email found for monitor ${monitor.name}`
            );
          }

          console.log(
            `[ALERT] Monitor "${
              monitor.name
            }" is now ${monitor.status.toUpperCase()}`
          );
        } else if (monitor.status === "up" && monitor.isAlertSent) {
          // Reset alert flag when monitor comes back up
          monitor.isAlertSent = false;
          console.log(`🔄 Reset alert flag for ${monitor.name} (now UP)`);
        }

        await monitor.save();

        console.log(
          `Checked: ${monitor.name} (${monitor.url}) → ${monitor.status} (Uptime: ${monitor.uptime}%)`
        );
      })
    );
  } catch (err) {
    console.error("[CRON ERROR]", err.message);
  }
};

const startCron = () => {
  // Validate email configuration
  if (!process.env.ALERT_EMAIL || !process.env.ALERT_PASSWORD) {
    console.warn(
      "⚠️ Email alerts disabled: ALERT_EMAIL or ALERT_PASSWORD not configured"
    );
    console.warn(
      "⚠️ Set ALERT_EMAIL and ALERT_PASSWORD in your .env file to enable email alerts"
    );
  } else {
    console.log("✅ Email configuration found: Alerts will be sent");
    console.log(`📧 Alert email: ${process.env.ALERT_EMAIL}`);
  }

  cron.schedule("* * * * *", checkUptime);
  console.log("🕒 Cron job started: checking monitors every 1 min");
};

module.exports = startCron;
