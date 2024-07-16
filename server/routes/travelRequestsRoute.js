const express = require("express");
const router = express.Router();
const travelRequestsController = require('../controllers/travelRequestsController');
const verifyPermissions = require('../middleware/verifyPermissions');


router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/",verifyPermissions(["Volunteer","Admin","Driver"]), travelRequestsController.getOpentravelRequests);
router.post("/",verifyPermissions(["Patient","Admin"]), travelRequestsController.createTravelRequest);
router.put("/:id",verifyPermissions(["Volunteer","Admin","Driver"]),travelRequestsController.requestTaken);

module.exports = router