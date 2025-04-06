const Project = require("../models/Projects");
const User = require("../models/Users");

exports.createProject = async (req, res) => {
  try {
    const { projectId, circle, division } = req.body;

    if (!circle || !division) {
      return res.status(400).json({ message: "All fields are required" });
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
      createdBy: req.user.id,
    });

    res.status(201).json(project);
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

   
    const employee = await User.findOne({ empId,role: "employee"});
    if (!employee) {
      return res.status(404).json({ message: "Employee not found or user doesn't have employee role" });
    }

   
    if (project.employees.some(emp => emp.equals(employee._id))) {
      return res.status(400).json({ message: "Employee already assigned" });
    }

    
    project.employees.push(employee._id);
    await project.save();

    const updatedProject = await Project.findOne({ projectId })
      .populate('employees', 'name empId -_id'); 

    res.status(200).json({
      message: "Employee assigned successfully",
      project: updatedProject
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
      employees: userId 
    }).select('projectId name description circle division')
      .populate('createdBy', 'name email');
    
    if (!projects || projects.length === 0) {
      return res.status(404).json({ 
        message: "No projects found for this employee" 
      });
    }

    res.status(200).json({
      message: "Projects retrieved successfully",
      count: projects.length,
      projects
    });

  } catch (error) {
    console.error("Error fetching employee projects:", error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};