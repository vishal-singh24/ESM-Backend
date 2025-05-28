const express = require('express');
const router = express.Router();
const kmzController = require('../controllers/kmzController');
const { authMiddleware } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/downloads/kmz/{projectId}/{empId}:
 *   get:
 *     summary: Download KMZ file of employee's waypoints of a project
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the project
 *       - in: path
 *         name: empId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID whose waypoints will be downloaded
 *     responses:
 *       200:
 *         description: KMZ file downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad Request - Missing projectId or empId
 *       403:
 *         description: Forbidden - Employee not part of project or not authorized
 *       404:
 *         description: Not Found - Project, employee, or waypoints not found
 *       500:
 *         description: Internal Server Error
 */


router.get("/kmz/:projectId/:empId",authMiddleware(['admin']), kmzController.downloadKmz);

module.exports = router;