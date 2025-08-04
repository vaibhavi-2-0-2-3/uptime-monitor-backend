const express = require("express");
const {
  createMonitor,
  getUserMonitors,
  updateMonitor,
  deleteMonitor,
} = require("../controllers/monitorController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All monitor routes are protected
router.use(authMiddleware);

router.post("/", createMonitor); // POST /api/monitors
router.get("/", getUserMonitors); // GET /api/monitors
router.put("/:id", updateMonitor); // PUT /api/monitors/:id
router.delete("/:id", deleteMonitor); // DELETE /api/monitors/:id

module.exports = router;
