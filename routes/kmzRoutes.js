const express = require('express');
const router = express.Router();
const kmzController = require('../controllers/kmzController');
const { authMiddleware } = require("../middlewares/authMiddleware");

router.get("/kmz/:projectId/:empId", kmzController.downloadKmz);

module.exports = router;