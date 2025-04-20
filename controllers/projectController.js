const Project = require("../models/Projects");
const User = require("../models/Users");

exports.createProject = async (req, res) => {
  try {
    const { projectId, circle, division,description } = req.body;

    if (!circle || !division) {
      return res.status(400).json({ message: "Circle and Division fields are required" });
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

    res.status(201).json({message:"Project Created successfully",project});
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
    const { coordinates, notes, images } = req.body;
    const employeeId = req.user._id;

    if (
      !coordinates ||
      !Array.isArray(coordinates) ||
      coordinates.length !== 2
    ) {
      return res.status(400).json({
        message: "Invalid coordinates format. Use [longitude, latitude]",
      });
    }

    const newWaypoint = {
      coordinates: {
        type: "Point",
        coordinates: coordinates,
      },
      notes: notes || "",
      images: images || [],
      createdBy: employeeId,
    };

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $push: { waypoints: newWaypoint } },
      { new: true }
    ).populate("waypoints.createdBy", "name email");

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(201).json({
      message: "Waypoint added successfully",
      waypoint: updatedProject.waypoints[updatedProject.waypoints.length - 1],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectWaypoints = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { role, _id: userId } = req.user;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (role === "employee" && !project.employees.includes(userId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this project" });
    }

    const waypoints =
      role === "admin"
        ? project.waypoints
        : project.waypoints.filter((wp) => wp.createdBy.equals(userId));

    res.status(200).json({ waypoints });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWaypoint = async (req, res) => {
  try {
    const { projectId, waypointId } = req.params;
    const { coordinates, notes, images } = req.body;
    const employeeId = req.user._id;

    if (!coordinates && !notes && !images) {
      return res.status(400).json({ message: "No fields to update provided" });
    }

    const updateFields = {};
    if (coordinates) {
      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        return res.status(400).json({
          message: "Invalid coordinates format. Use [longitude, latitude]",
        });
      }
      updateFields["waypoints.$.coordinates"] = {
        type: "Point",
        coordinates: coordinates,
      };
    }
    if (notes !== undefined) updateFields["waypoints.$.notes"] = notes;
    if (images !== undefined) updateFields["waypoints.$.images"] = images;

    const updatedProject = await Project.findOneAndUpdate(
      {
        _id: projectId,
        "waypoints._id": waypointId,
        "waypoints.createdBy": employeeId,
      },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({
        message: "Project/waypoint not found or unauthorized to update",
      });
    }

    const updatedWaypoint = updatedProject.waypoints.find(
      (wp) => wp._id.toString() === waypointId
    );

    res.status(200).json({
      message: "Waypoint updated successfully",
      waypoint: updatedWaypoint,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
