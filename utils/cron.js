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
        const start = Date.now();
        let status = "down";
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
            status = "up";
            message = "OK";
          } else {
            message = `Unexpected status code: ${res.status}`;
          }
        } catch (err) {
          message = err.message || "Request failed";
          responseTime = Date.now() - start;
        }

        await MonitorLog.create({
          monitorId: monitor._id,
          status,
          responseCode,
          responseTime,
          message,
        });

        if (monitor.status !== status) {
          monitor.status = status;
          monitor.lastCheckedAt = new Date();
          monitor.isAlertSent = status === "down";
          await monitor.save();

          const user = await User.findById(monitor.user);
          if (user && user.email) {
            const subject = `🚨 [${status.toUpperCase()}] ${monitor.name}`;
            const msg = `Monitor: ${monitor.name}\nURL: ${
              monitor.url
            }\nStatus: ${status.toUpperCase()}\nChecked at: ${new Date().toLocaleString()}`;
            console.log("🔔 Sending alert to:", user.email);
            await sendEmail(user.email, subject, msg);
          }

          console.log(
            `[ALERT] Monitor "${monitor.name}" is now ${status.toUpperCase()}`
          );
        } else {
          monitor.lastCheckedAt = new Date();
          await monitor.save();
        }

        console.log(`Checked: ${monitor.name} (${monitor.url}) → ${status}`);
      })
    );
  } catch (err) {
    console.error("[CRON ERROR]", err.message);
  }
};

const startCron = () => {
  cron.schedule("* * * * *", checkUptime);
  console.log("🕒 Cron job started: checking monitors every 1 min");
};

module.exports = startCron;
