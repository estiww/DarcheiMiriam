const express = require("express");
const router = express.Router();
const usersController = require('../controllers/usersController')
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/",usersController.login);

module.exports = router