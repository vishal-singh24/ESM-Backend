const express = require("express");
const {
  createProject,
  assignEmployee,
  getMyProjects,
  addWaypoint,
  getProjectWaypoints,
  updateWaypoint,
  allProjects,
  getAllWaypointsEmployee,
} = require("../controllers/projectController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /api/projects/create-project:
 *   post:
 *     summary: Create a new project
 *     description: Create a new project with division, cirlce and description. Only admin can create projects.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - circle
 *               - division
 *             properties:
 *               circle:
 *                 type: string
 *                 description: Circle of the project
 *               division:
 *                 type: string
 *                 description: Division of the project
 *               description:
 *                 type: string
 *                 description: Description of the project
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Circle and Division fields are required or Project with this name already exists
 *       401:
 *         description: Unauthorized - Bearer token missing or invalid
 *       403:
 *         description: Forbidden - Only admin can create projects
 *       500:
 *         description: Internal server error
 */
router.post("/create-project", authMiddleware("admin"), createProject);
/**
 * @swagger
 * /api/projects/{projectId}/assign:
 *   post:
 *     summary: Assign an employee to a project
 *     description: Assign an employee to a project by their empId. Only admin can assign employees.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project to which the employee will be assigned
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - empId
 *             properties:
 *               empId:
 *                 type: string
 *                 description: Employee ID of the user to be assigned to the project
 *     responses:
 *       200:
 *         description: Employee assigned successfully
 *       400:
 *         description: Employee ID (empId) is required or Employee already assigned or Project not found or Employee not found or user doesn't have employee role
 *       401:
 *         description: Unauthorized - Bearer token missing or invalid
 *       500:
 *         description: Internal server error
 */
router.post("/:projectId/assign", authMiddleware("admin"), assignEmployee);
/**
 * @swagger
 * /api/projects/my-projects:
 *   get:
 *     summary: Get all projects assigned to the logged-in employee
 *     description: Retrieve all projects assigned to the logged-in employee. Only employees can access this endpoint.
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects assigned to the employee
 *       401:
 *         description: Unauthorized - Bearer token missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get("/my-projects", authMiddleware("employee"), getMyProjects);

/**
 * @swagger
 * /api/projects/all-projects:
 *   get:
 *     summary: Get all projects
 *     description: Retrieve all projects. Only admin can access this endpoint.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all projects
 *       401:
 *         description: Unauthorized - Bearer token missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get("/all-projects", authMiddleware(["admin"]), allProjects);

/**
 * @swagger
 * /api/projects/{projectId}/waypoints:
 *   post:
 *     summary: Add a waypoint to a project
 *     description: Add a waypoint to a project by its ID. Only assigned employees can add waypoints.
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project to which the waypoint will be added
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - latitude
 *               - longitude
 *               - poleDetails
 *               - gpsDetails
 *               - isStart
 *               - isEnd
 *
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the waypoint
 *               description:
 *                 type: string
 *                 description: Description of the waypoint
 *               distanceFromPrevious:
 *                 type: number
 *                 description: Distance from the previous waypoint in meters
 *               latitude:
 *                 type: number
 *                 description: Latitude coordinate of the waypoint
 *               longitude:
 *                 type: number
 *                 description: Longitude coordinate of the waypoint
 *               isStart:
 *                 type: boolean
 *                 description: Indicates if this waypoint is the starting point
 *                 default: false
 *               isEnd:
 *                 type: boolean
 *                 description: Indicates if this waypoint is the ending point
 *                 default: false
 *               image:
 *                 type: string
 *                 description: Image URL of the waypoint
 *               poleDetails:
 *                 type: array
 *                 description: Array of pole details associated with this waypoint
 *                 items:
 *                   type: object
 *                   properties:
 *                     poleNo:
 *                       type: number
 *                       description: Pole number
 *                     existingOrNewProposed:
 *                       type: string
 *                       description: Whether the pole is existing or newly proposed
 *                     poleDiscription:
 *                       type: string
 *                       description: Description of the pole
 *                     poleType:
 *                       type: string
 *                       description: Type of the pole
 *                     poleSizeInMeter:
 *                       type: number
 *                       description: Size of the pole in meters
 *                     poleStructure:
 *                       type: string
 *                       description: Structure of the pole
 *                     _3PhaseLTDistributionBox:
 *                       type: number
 *                       default: 0
 *                     abSwitch:
 *                       type: number
 *                       default: 0
 *                     anchorRod:
 *                       type: number
 *                       default: 0
 *                     anchoringAssembly:
 *                       type: number
 *                       default: 0
 *                     angle4Feet:
 *                       type: number
 *                       default: 0
 *                     angle9Feet:
 *                       type: number
 *                       default: 0
 *                     basePlat:
 *                       type: number
 *                       default: 0
 *                     channel4Feet:
 *                       type: number
 *                       default: 0
 *                     channel9Feet:
 *                       type: number
 *                       default: 0
 *                     doChannel:
 *                       type: number
 *                       default: 0
 *                     doChannelBackClamp:
 *                       type: number
 *                       default: 0
 *                     doFuse:
 *                       type: number
 *                       default: 0
 *                     discHardware:
 *                       type: number
 *                       default: 0
 *                     discInsulatorPolymeric:
 *                       type: number
 *                       default: 0
 *                     discInsulatorPorcelain:
 *                       type: number
 *                       default: 0
 *                     dtrBaseChannel:
 *                       type: number
 *                       default: 0
 *                     dtrSpottingAngle:
 *                       type: number
 *                       default: 0
 *                     dvcConductor:
 *                       type: number
 *                       default: 0
 *                     earthingConductor:
 *                       type: number
 *                       default: 0
 *                     elbow:
 *                       type: number
 *                       default: 0
 *                     eyeBolt:
 *                       type: number
 *                       default: 0
 *                     giPin:
 *                       type: number
 *                       default: 0
 *                     giPipe:
 *                       type: number
 *                       default: 0
 *                     greeper:
 *                       type: number
 *                       default: 0
 *                     guyInsulator:
 *                       type: number
 *                       default: 0
 *                     iHuckClamp:
 *                       type: number
 *                       default: 0
 *                     lightingArrestor:
 *                       type: number
 *                       default: 0
 *                     pinInsulatorPolymeric:
 *                       type: number
 *                       default: 0
 *                     pinInsulatorPorcelain:
 *                       type: number
 *                       default: 0
 *                     poleEarthing:
 *                       type: number
 *                       default: 0
 *                     sideClamp:
 *                       type: number
 *                       default: 0
 *                     spottingAngle:
 *                       type: number
 *                       default: 0
 *                     spottingChannel:
 *                       type: number
 *                       default: 0
 *                     stayClamp:
 *                       type: number
 *                       default: 0
 *                     stayInsulator:
 *                       type: number
 *                       default: 0
 *                     stayRoad:
 *                       type: number
 *                       default: 0
 *                     stayWire712:
 *                       type: number
 *                       default: 0
 *                     suspensionAssemblyClamp:
 *                       type: number
 *                       default: 0
 *                     topChannel:
 *                       type: number
 *                       default: 0
 *                     topClamp:
 *                       type: number
 *                       default: 0
 *                     turnBuckle:
 *                       type: number
 *                       default: 0
 *                     vCrossArm:
 *                       type: number
 *                       default: 0
 *                     vCrossArmClamp:
 *                       type: number
 *                       default: 0
 *                     xBressing:
 *                       type: number
 *                       default: 0
 *                     earthingCoil:
 *                       type: number
 *                       default: 0
 *               gpsDetails:
 *                 type: array
 *                 description: Array of GPS details associated with this waypoint
 *                 items:
 *                   type: object
 *                   properties:
 *                     timeAndDate:
 *                       type: string
 *                       description: Timestamp of the GPS recording
 *                     userId:
 *                       type: string
 *                       description: ID of the user who recorded the GPS data
 *                     district:
 *                       type: string
 *                       description: District where the waypoint is located
 *                     routeStartPoint:
 *                       type: string
 *                       description: Starting point of the route
 *                     lengthperKm:
 *                       type: number
 *                       description: Length in kilometers
 *                     startPointCoordinates:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                         longitude:
 *                           type: number
 *                     currentWaypointCoordinates:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                         longitude:
 *                           type: number
 *                     substationName:
 *                       type: string
 *                     feederName:
 *                       type: string
 *                     conductor:
 *                       type: string
 *                     cable:
 *                       type: string
 *                     transformerLocation:
 *                       type: string
 *                     transformerKV:
 *                       type: string
 *                     ltDistributionBox3Phase:
 *                       type: number
 *                       default: 0
 *                     abSwitch:
 *                       type: number
 *                       default: 0
 *                     anchorRod:
 *                       type: number
 *                       default: 0
 *                     anchoringAssembly:
 *                       type: number
 *                       default: 0
 *                     angle4Feet:
 *                       type: number
 *                       default: 0
 *                     angle9Feet:
 *                       type: number
 *                       default: 0
 *                     basePlat:
 *                       type: number
 *                       default: 0
 *                     channel4Feet:
 *                       type: number
 *                       default: 0
 *                     channel9Feet:
 *                       type: number
 *                       default: 0
 *                     doChannel:
 *                       type: number
 *                       default: 0
 *                     doChannelBackClamp:
 *                       type: number
 *                       default: 0
 *                     doFuse:
 *                       type: number
 *                       default: 0
 *                     discHardware:
 *                       type: number
 *                       default: 0
 *                     discInsulatorPolymeric:
 *                       type: number
 *                       default: 0
 *                     discInsulatorPorcelain:
 *                       type: number
 *                       default: 0
 *                     dtrBaseChannel:
 *                       type: number
 *                       default: 0
 *                     dtrSpottingAngle:
 *                       type: number
 *                       default: 0
 *                     dtrSpottingAngleWithClamp:
 *                       type: number
 *                       default: 0
 *                     dvcConductor:
 *                       type: number
 *                       default: 0
 *                     earthingConductor:
 *                       type: number
 *                       default: 0
 *                     elbow:
 *                       type: number
 *                       default: 0
 *                     eyeBolt:
 *                       type: number
 *                       default: 0
 *                     giPin:
 *                       type: number
 *                       default: 0
 *                     giPipe:
 *                       type: number
 *                       default: 0
 *                     greeper:
 *                       type: number
 *                       default: 0
 *                     guyInsulator:
 *                       type: number
 *                       default: 0
 *                     iHuckClamp:
 *                       type: number
 *                       default: 0
 *                     lightingArrestor:
 *                       type: number
 *                       default: 0
 *                     pinInsulatorPolymeric:
 *                       type: number
 *                       default: 0
 *                     pinInsulatorPorcelain:
 *                       type: number
 *                       default: 0
 *                     poleEarthing:
 *                       type: number
 *                       default: 0
 *                     sideClamp:
 *                       type: number
 *                       default: 0
 *                     spottingAngle:
 *                       type: number
 *                       default: 0
 *                     spottingChannel:
 *                       type: number
 *                       default: 0
 *                     stayClamp:
 *                       type: number
 *                       default: 0
 *                     stayInsulator:
 *                       type: number
 *                       default: 0
 *                     stayRoad:
 *                       type: number
 *                       default: 0
 *                     stayWire712:
 *                       type: number
 *                       default: 0
 *                     suspensionAssemblyClamp:
 *                       type: number
 *                       default: 0
 *                     topChannel:
 *                       type: number
 *                       default: 0
 *                     topClamp:
 *                       type: number
 *                       default: 0
 *                     turnBuckle:
 *                       type: number
 *                       default: 0
 *                     vCrossArm:
 *                       type: number
 *                       default: 0
 *                     vCrossArmClamp:
 *                       type: number
 *                       default: 0
 *                     xBressing:
 *                       type: number
 *                       default: 0
 *                     earthingCoil:
 *                       type: number
 *                       default: 0
 *     responses:
 *       201:
 *         description: Waypoint added successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - User not assigned to project
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.post("/:projectId/waypoints", authMiddleware("employee"), addWaypoint);

/**
 * @swagger
 * /api/projects/{projectId}/waypoints:
 *   get:
 *     summary: Get all waypoints of a project
 *     description: Retrieve all waypoints of a project by project ID. When employee will access this end-point then waypoints created by him/her will be shown and if this end-points is accessed by admin then all the waypoints will be shown.
 *     tags: [Employee,Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project whose waypoints will be retrieved
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of waypoints for the project
 *       401:
 *         description: Unauthorized - Bearer token missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:projectId/waypoints",
  authMiddleware(["employee", "admin"]),
  getProjectWaypoints
);

// /**
//  * @swagger
//  * /api/projects/{projectId}/waypoints/{waypointId}:
//  *   patch:
//  *     summary: Update a waypoint of a project
//  *     description: Update a waypoint of a project by its ID. Only employees can update waypoints.
//  *     tags:
//  *       - Employee
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: projectId
//  *         required: true
//  *         description: ID of the project whose waypoint will be updated
//  *         schema:
//  *           type: string
//  *       - in: path
//  *         name: waypointId
//  *         required: true
//  *         description: ID of the waypoint to be updated
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *                 description: Name of the waypoint
//  *               location:
//  *                 type: string
//  *                 description: Location of the waypoint
//  *               coordinates:
//  *                 type: array
//  *                 items:
//  *                   type: number
//  *                 description: Coordinates of the waypoint
//  *     responses:
//  *       200:
//  *         description: Waypoint updated successfully
//  *       400:
//  *         description: Invalid input
//  *       401:
//  *         description: Unauthorized
//  *       404:
//  *         description: Project or waypoint not found
//  *       500:
//  *         description: Internal server error
//  */

// router.patch("/:projectId/waypoints/:waypointId", authMiddleware("employee"), updateWaypoint);


/**
 * @swagger
 * /api/projects/employee-waypoints:
 *   get:
 *     summary: Get all waypoints created by an employee across projects
 *     description: Retrieve all waypoints created by the employee (empId) across all projects they are assigned to.
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of waypoints created by the employee across projects
 *       401:  
 *         description: Unauthorized - Bearer token missing or invalid
 *       404:
 *         description: Employee not found with this empId
 *       500:
 *         description: Internal server error
 */
router.get(
  "/employee-waypoints",
  authMiddleware("employee"),
  getAllWaypointsEmployee
);

module.exports = router;
