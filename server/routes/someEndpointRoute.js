const express = require("express");
const router = express.Router();
const someEndpointController = require('../controllers/someEndpointController')
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/",someEndpointController.someEndpoint);

module.exports = router;
