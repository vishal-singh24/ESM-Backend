const express = require("express");
const { createProject, assignEmployee } = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware("admin"), createProject);
router.post("/:projectId/assign", authMiddleware("admin"), assignEmployee);

module.exports = router;
