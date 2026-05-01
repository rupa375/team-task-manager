const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");

// POST /api/projects  — Create project (creator becomes admin)
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length < 1) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = await Project.create({
      name,
      description,
      admin: req.user._id,
      members: [],
    });

    await project.populate("admin", "name email");
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/projects  — Get all projects the user is part of
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ admin: req.user._id }, { members: req.user._id }],
    })
      .populate("admin", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("admin", "name email")
      .populate("members", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check access
    const userId = req.user._id.toString();
    const isAdmin = project.admin._id.toString() === userId;
    const isMember = project.members.some((m) => m._id.toString() === userId);

    if (!isAdmin && !isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/projects/:projectId/members  — Admin adds a member by email
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const project = req.project; // set by roleMiddleware

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: "User not found with that email" });
    }

    const alreadyMember = project.members.includes(userToAdd._id);
    const isAdmin = project.admin.toString() === userToAdd._id.toString();

    if (alreadyMember || isAdmin) {
      return res.status(400).json({ message: "User is already in this project" });
    }

    project.members.push(userToAdd._id);
    await project.save();
    await project.populate("members", "name email");
    await project.populate("admin", "name email");

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/projects/:projectId/members/:memberId  — Admin removes a member
const removeMember = async (req, res) => {
  try {
    const project = req.project;
    const { memberId } = req.params;

    project.members = project.members.filter(
      (m) => m.toString() !== memberId
    );
    await project.save();

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/projects/:id  — Admin deletes project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the admin can delete this project" });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  removeMember,
  deleteProject,
};