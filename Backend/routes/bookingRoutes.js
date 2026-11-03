const router = require("express").Router();
const { protect } = require("../middleware/auth");
const controller = require("../controllers/bookingController");

router.use(protect);
router.get("/mine", controller.myBookings);
router.post("/item/:itemId", controller.createBooking);
router.get("/:id", controller.getBooking);
router.patch("/:id/respond", controller.respondToRequest);
router.patch("/:id/cancel", controller.cancelBooking);
router.patch("/:id/handover", controller.confirmHandover);
router.patch("/:id/return", controller.confirmReturn);

module.exports = router;
