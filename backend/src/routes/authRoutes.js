const express = require("express");
const router = express.Router();
const { signup, login, getMe, promoteToAdmin } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware"); 

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.patch("/promote", protect, adminOnly, promoteToAdmin); 

module.exports = router;