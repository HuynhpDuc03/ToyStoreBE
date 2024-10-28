const express = require("express");
const router = express.Router()
const DashboardController = require('../controllers/DashboardController');
const { authMiddleWare } = require("../middleware/authMiddleware");


router.post('/get-chart-Revenue', DashboardController.getRevenue);
router.get('/get-summary', DashboardController.getDashboardSummary);
router.get('/get-chartCategoryStock', DashboardController.getChartCategoryStock);
router.get('/get-chartProductStock', DashboardController.getChartProductStock);
router.get('/get-stockPercentage', DashboardController.getStockPercentage);

module.exports = router