const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const cors = require("cors");
const monitorRoutes = require("./routes/monitors");

const startCron = require("./utils/cron");
startCron();

connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://uptime-monitor-beta.vercel.app",
];

// Allow dynamic check for subdomains and staging URLs
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(new URL(origin).hostname)
      ) {
        return callback(null, true);
      } else {
        console.log(`❌ CORS blocked: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Debug CORS configuration
console.log("🔧 CORS Configuration:");
console.log("   - Origin: http://localhost:5173");
console.log("   - Credentials: true");
console.log("🔧 CORS Configuration Allowed Origins:", allowedOrigins);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/monitors", monitorRoutes);

app.get("/", (req, res) => res.send("API is running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`📊 Monitor endpoints: http://localhost:${PORT}/api/monitors`);
});
