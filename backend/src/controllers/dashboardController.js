const Task = require("../models/Task");
const Project = require("../models/Project");

// GET /api/dashboard  — Summary stats for the logged-in user
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Projects the user belongs to (as admin or member)
    const projects = await Project.find({
      $or: [{ admin: userId }, { members: userId }],
    });

    const projectIds = projects.map((p) => p._id);

    // For admins: all tasks in their projects | For members: only assigned tasks
    const adminProjectIds = projects
      .filter((p) => p.admin.toString() === userId.toString())
      .map((p) => p._id);

    const memberProjectIds = projects
      .filter((p) => p.members.map((m) => m.toString()).includes(userId.toString()))
      .map((p) => p._id);

    // Fetch tasks visible to this user
    const tasks = await Task.find({
      $or: [
        { project: { $in: adminProjectIds } },
        { project: { $in: memberProjectIds }, assignedTo: userId },
      ],
    }).populate("assignedTo", "name email").populate("project", "name");

    // Aggregate stats
    const totalTasks = tasks.length;
    const todoTasks = tasks.filter((t) => t.status === "todo").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
    const doneTasks = tasks.filter((t) => t.status === "done").length;
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done"
    ).length;

    // Tasks per user (admin view)
    const tasksByUser = {};
    tasks.forEach((task) => {
      if (task.assignedTo) {
        const name = task.assignedTo.name;
        tasksByUser[name] = (tasksByUser[name] || 0) + 1;
      }
    });

    res.json({
      totalProjects: projects.length,
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      tasksByUser,
      recentTasks: tasks.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };