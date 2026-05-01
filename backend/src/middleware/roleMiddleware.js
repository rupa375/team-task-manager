const Project = require("../models/Project");

// Check if current user is the admin of the project
const isProjectAdmin = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId || req.body.project);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if current user is a member or admin of the project
const isProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.project || req.query.projectId;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const userId = req.user._id.toString();
    const isAdmin = project.admin.toString() === userId;
    const isMember = project.members.map((m) => m.toString()).includes(userId);

    if (!isAdmin && !isMember) {
      return res.status(403).json({ message: "Access denied. Not a project member." });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { isProjectAdmin, isProjectMember };