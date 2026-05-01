const Task = require("../models/Task");
const Project = require("../models/Project");
const { validateTask } = require("../utils/validators");

// POST /api/tasks  — Create task (admin only)
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, project, assignedTo } = req.body;

    const errors = validateTask(title, status, priority);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    // Check project exists and user is admin
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (projectDoc.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only project admin can create tasks" });
    }

    // If assigning, verify that user is a project member or admin
    if (assignedTo) {
      const isAdminAssignee = projectDoc.admin.toString() === assignedTo;
      const isMemberAssignee = projectDoc.members.map((m) => m.toString()).includes(assignedTo);
      if (!isAdminAssignee && !isMemberAssignee) {
        return res.status(400).json({ message: "Assigned user is not a project member" });
      }
    }

    const task = await Task.create({
      title,
      description,
      status: status || "todo",
      priority: priority || "medium",
      dueDate,
      project,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
    });

    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");
    await task.populate("project", "name");

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/tasks?projectId=xxx  — Get tasks for a project
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ message: "projectId query param is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const userId = req.user._id.toString();
    const isAdmin = project.admin.toString() === userId;
    const isMember = project.members.map((m) => m.toString()).includes(userId);

    if (!isAdmin && !isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Members only see their assigned tasks; admin sees all
    const filter = { project: projectId };
    if (!isAdmin) {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/tasks/:id  — Update task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const userId = req.user._id.toString();
    const isAdmin = task.project.admin.toString() === userId;
    const isAssignee = task.assignedTo && task.assignedTo.toString() === userId;

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Members can only update status
    if (!isAdmin) {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Members can only update task status" });
      }
      task.status = status;
    } else {
      // Admin can update all fields
      const { title, description, status, priority, dueDate, assignedTo } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    }

    await task.save();
    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/tasks/:id  — Admin deletes task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only project admin can delete tasks" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };