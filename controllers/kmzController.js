const Project = require("../models/Projects");
const User = require("../models/Users");
const generateKmzBuffer = require("../utils/generateKmzBuffer");

exports.downloadKmz = async (req, res) => {
  try {
    const { projectId, empId } = req.params;

    if (!projectId || !empId) {
      return res
        .status(400)
        .json({ message: "Both projectId and empId are required" });
    }

    // Find the user first to get their _id
    const user = await User.findOne({ empId: empId });
    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const project = await Project.findOne({ projectId }).populate("employees");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if employee is part of the project
    const employeeInProject = project.employees.some(
      (employee) => employee.empId === empId
    );

    if (!employeeInProject) {
      return res
        .status(403)
        .json({ message: "Employee is not part of this project" });
    }

    

    // Filter waypoints using user's _id
    const allWaypoints = project.waypoints.flat().filter((wp) => {
      return wp.createdBy.toString() === user._id.toString();
    });

    

    if (allWaypoints.length === 0) {
      console.log("No waypoints found after filtering", {
        employeeObjectId: user._id,
        empId,
        totalWaypoints: project.waypoints.flat().length,
        waypointCreatedByValues: project.waypoints
          .flat()
          .map((wp) => wp.createdBy),
      });
      return res.status(404).json({
        message: "No waypoints found for this employee in the project",
        details: {
          employeeId: user._id,
          empId,
          totalWaypoints: project.waypoints.flat().length,
          waypointCreatedByValues: project.waypoints
            .flat()
            .map((wp) => wp.createdBy),
        },
      });
    }

    const kmzBuffer = await generateKmzBuffer(allWaypoints);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${projectId}_feeder.kmz`
    );
    res.setHeader("Content-Type", "application/vnd.google-earth.kmz");
    res.send(kmzBuffer);
  } catch (err) {
    console.error("KMZ generation error:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
