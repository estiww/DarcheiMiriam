const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");

router.post('/', passwordController.forgotPassword);

module.exports = router;
