const express = require("express");
const {
  createProject,
  assignEmployee,
  getMyProjects
} = require("../controllers/projectController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create-project", authMiddleware("admin"), createProject);
router.post("/:projectId/assign", authMiddleware("admin"), assignEmployee);
router.get('/my-projects', authMiddleware('employee'), getMyProjects);

module.exports = router;
