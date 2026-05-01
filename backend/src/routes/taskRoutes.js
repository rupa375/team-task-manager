const express = require("express");
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask, getMyTasks } = require("../controllers/taskController"); 
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/my", getMyTasks);   
router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;