const express = require("express");
const {
  createMonitor,
  getUserMonitors,
  editMonitor,
  togglePauseMonitor,
  deleteMonitor,
} = require("../controllers/monitorController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All monitor routes are protected
router.use(authMiddleware);

router.post("/", createMonitor); // POST /api/monitors
router.get("/", getUserMonitors); // GET /api/monitors
router.patch("/:id", editMonitor); // PATCH /api/monitors/:id (edit)
router.patch("/:id/pause", togglePauseMonitor); // PATCH /api/monitors/:id/pause
router.delete("/:id", deleteMonitor); // DELETE /api/monitors/:id

module.exports = router;
