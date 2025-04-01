const Project = require("../models/Projects");
const User = require("../models/Users");

exports.createProject = async (req, res) => {
  try {
    const { name, circle, division } = req.body;

    if (!name || !circle || !division) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingProject = await Project.findOne({ name });
    if (existingProject) {
      return res.status(400).json({ message: "Project with this name already exists" });
    }

    const project = await Project.create({
      name,
      circle,
      division,
      createdBy: req.user.id,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: "Error creating project", error });
  }
};

exports.assignEmployee = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.employees.push(req.body.employeeId);
    await project.save();

    res.json({ message: "Employee assigned", project });
  } catch (error) {
    res.status(500).json({ message: "Error assigning employee", error });
  }
};
