const router = require("express").Router();
const { protect } = require("../middleware/auth");
const controller = require("../controllers/itemController");

router.get("/", controller.listItems);
router.get("/mine", protect, controller.myItems);
router.post("/", protect, controller.createItem);
router.get("/:id", controller.getItem);
router.patch("/:id", protect, controller.updateItem);
router.patch("/:id/pause", protect, controller.pauseItem);
router.delete("/:id", protect, controller.deleteItem);

module.exports = router;
