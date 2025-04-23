const Project = require("../models/Projects");
const User = require("../models/Users");

exports.createProject = async (req, res) => {
  try {
    const { projectId, circle, division, description } = req.body;

    if (!circle || !division) {
      return res
        .status(400)
        .json({ message: "Circle and Division fields are required" });
    }
    const existingProject = await Project.findOne({ projectId });
    if (existingProject) {
      return res
        .status(400)
        .json({ message: "Project with this name already exists" });
    }

    const project = await Project.create({
      projectId,
      circle,
      division,
      description,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Project Created successfully", project });
  } catch (error) {
    res.status(400).json({ message: "Error creating project", error });
  }
};

exports.assignEmployee = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { empId } = req.body;

    if (!empId) {
      return res
        .status(400)
        .json({ message: "Employee ID (empId) is required" });
    }

    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const employee = await User.findOne({ empId, role: "employee" });
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found or user doesn't have employee role",
      });
    }

    if (project.employees.some((emp) => emp.equals(employee._id))) {
      return res.status(400).json({ message: "Employee already assigned" });
    }

    project.employees.push(employee._id);
    await project.save();

    const updatedProject = await Project.findOne({ projectId }).populate(
      "employees",
      "name empId -_id"
    );

    res.status(200).json({
      message: "Employee assigned successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error assigning employee:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user._id;

    const projects = await Project.find({
      employees: userId,
    })
      .select("projectId name description circle division")
      .populate("createdBy", "name email");

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        message: "No projects found for this employee",
      });
    }

    res.status(200).json({
      message: "Projects retrieved successfully",
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Error fetching employee projects:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.addWaypoint = async (req, res) => {
  try {
    const { projectId } = req.params;
    const employeeId = req.user._id;

    const project = await Project.findOne({ projectId });
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Check if employee is assigned to the project
    if (!project.employees.includes(employeeId)) {
      return res.status(403).json({ message: "Not assigned to this project" });
    }

    const {
      name,
      latitude,
      longitude,
      isStart,
      isEnd,
      poleDetails = [],
      gpsDetails = [],
    } = req.body;

    // Validate required fields
    if (
      !name ||
      latitude == null ||
      longitude == null ||
      isStart == null ||
      isEnd == null
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const waypoint = {
      name,
      latitude,
      longitude,
      isStart: Boolean(isStart),
      isEnd: Boolean(isEnd),
      poleDetails,
      gpsDetails,
      createdBy: employeeId,
      timestamp: new Date(),
      pathOwner: isStart ? employeeId : null, 
    };

    
    if (project.waypoints.length === 0) {
      waypoint.pathOwner = employeeId; 
      project.waypoints.push([waypoint]);
    }

    
    else if (waypoint.isStart) {
      waypoint.pathOwner = employeeId;
      project.waypoints.push([waypoint]);
    }

    
    else {
      const lastPath = project.waypoints[project.waypoints.length - 1];
      const lastPathOwner = lastPath[0].pathOwner; 

      if (lastPathOwner.toString() === employeeId.toString()) {
        lastPath.push(waypoint); 
      } else {
        return res.status(403).json({
          message:
            "You can only add to paths you started. Start a new path with `isStart: true`.",
        });
      }
    }

    await project.save();
    res.status(201).json({ message: "Waypoint added successfully", waypoint });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProjectWaypoints = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { role, _id: userId } = req.user;

    // Find project with populated employees if needed
    const project = await Project.findOne({ projectId })
      .select('waypoints employees')
      .lean();

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Authorization check
    if (role === "employee" && !project.employees.some(id => id.equals(userId))) {
      return res.status(403).json({ 
        message: "Not authorized to access this project" 
      });
    }

    // Filter waypoints based on role
    let filteredWaypoints;
    if (role === "admin") {
      // Admin gets all waypoints
      filteredWaypoints = project.waypoints;
    } else {
      // Employee gets only their paths (entire paths they started)
      filteredWaypoints = project.waypoints.filter(path => 
        path.length > 0 && path[0].createdBy.equals(userId)
      );
    }

    res.status(200).json({ 
      success: true,
      waypoints: filteredWaypoints 
    });
  } catch (error) {
    console.error('Error fetching waypoints:', error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};

// exports.updateWaypoint = async (req, res) => {
//   try {
//     const { projectId, waypointId } = req.params;
//     const { coordinates, notes, images } = req.body;
//     const employeeId = req.user._id;

//     if (!coordinates && !notes && !images) {
//       return res.status(400).json({ message: "No fields to update provided" });
//     }

//     const updateFields = {};
//     if (coordinates) {
//       if (!Array.isArray(coordinates) || coordinates.length !== 2) {
//         return res.status(400).json({
//           message: "Invalid coordinates format. Use [longitude, latitude]",
//         });
//       }
//       updateFields["waypoints.$.coordinates"] = {
//         type: "Point",
//         coordinates: coordinates,
//       };
//     }
//     if (notes !== undefined) updateFields["waypoints.$.notes"] = notes;
//     if (images !== undefined) updateFields["waypoints.$.images"] = images;

//     const updatedProject = await Project.findOneAndUpdate(
//       {
//         _id: projectId,
//         "waypoints._id": waypointId,
//         "waypoints.createdBy": employeeId,
//       },
//       { $set: updateFields },
//       { new: true }
//     );

//     if (!updatedProject) {
//       return res.status(404).json({
//         message: "Project/waypoint not found or unauthorized to update",
//       });
//     }

//     const updatedWaypoint = updatedProject.waypoints.find(
//       (wp) => wp._id.toString() === waypointId
//     );

//     res.status(200).json({
//       message: "Waypoint updated successfully",
//       waypoint: updatedWaypoint,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.allProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .select("projectId description circle division")
      .populate("createdBy", "name email")
      .populate("employees", "name empId -_id");

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        message: "No projects found",
      });
    }

    res.status(200).json({
      message: "Projects retrieved successfully",
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Error fetching all projects:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
