const express = require('express');
const router = express.Router();
const RatingController = require('../controllers/RatingController');
const { authMiddleWare } = require("../middleware/authMiddleware");

router.post('/addReview', RatingController.addRating);
module.exports = router;
