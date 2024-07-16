const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const verifyPermissions = require('../middleware/verifyPermissions');

router.get("/",verifyPermissions(["Admin"]), usersController.getAll);
router.patch("/:id",verifyPermissions(["Admin"]),usersController.updateIsApproved);
router.put("/:id",usersController.updateUserDetails);
router.post("/",verifyPermissions(["Admin"]),usersController.createUser);
module.exports = router;