const express = require("express");
const router = express.Router();
const travelMatchesController = require('../controllers/travelMatchesController');
const verifyPermissions = require('../middleware/verifyPermissions');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/upcoming", verifyPermissions(["Volunteer","Driver"]), travelMatchesController.getUpcomingTravels); 
router.get("/", verifyPermissions(["Admin"]), travelMatchesController.getTravelMatches);
router.get('/:userId', verifyPermissions(["Volunteer","Patient","Driver"]),travelMatchesController.getMyTravels)
router.post("/:requestId",verifyPermissions(["Volunteer","Admin","Driver"]),travelMatchesController.createTravelMatch);


module.exports = router