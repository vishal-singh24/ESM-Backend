const express = require("express");
const {
  createProject,
  assignEmployee,
  getMyProjects,
  addWaypoint,
  getProjectWaypoints,
  updateWaypoint,
  allProjects,
} = require("../controllers/projectController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create-project", authMiddleware("admin"), createProject);
router.post("/:projectId/assign", authMiddleware("admin"), assignEmployee);
router.get("/my-projects", authMiddleware("employee"), getMyProjects);
router.get("/all-projects",authMiddleware(["admin"]),allProjects);

router.post("/:projectId/waypoints", authMiddleware("employee"), addWaypoint);
router.get("/:projectId/waypoints", authMiddleware("employee"), getProjectWaypoints);
router.patch("/:projectId/waypoints/:waypointId", authMiddleware("employee"), updateWaypoint); 


module.exports = router;
