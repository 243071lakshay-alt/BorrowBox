const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth");
const { getProfile, updateProfile, listUsers } = require("../controllers/userController");

router.get("/me", protect, getProfile);
router.patch("/me", protect, updateProfile);
router.get("/", protect, adminOnly, listUsers);

module.exports = router;
