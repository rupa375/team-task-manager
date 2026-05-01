const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  removeMember,
  deleteProject,
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");
const { isProjectAdmin } = require("../middleware/roleMiddleware");

router.use(protect);

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:id", getProjectById);
router.delete("/:id", deleteProject);

// Member management (admin only)
router.post("/:projectId/members", isProjectAdmin, addMember);
router.delete("/:projectId/members/:memberId", isProjectAdmin, removeMember);

module.exports = router;