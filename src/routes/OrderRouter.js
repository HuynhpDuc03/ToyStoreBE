const express = require("express");
const router = express.Router()
const OrderController = require('../controllers/OrderController');
const { authUserMiddleWare, authMiddleWare } = require("../middleware/authMiddleware");


router.post('/create', authUserMiddleWare, OrderController.createOrder)
router.get('/get-all-order-details/:id',authUserMiddleWare, OrderController.getAllOrderDetails)
router.get('/get-details-order/:id', authUserMiddleWare, OrderController.getDetailsOrder)
router.delete('/cancel-order/:id',authUserMiddleWare, OrderController.cancelOrderDetails)
router.get('/get-all-order',authMiddleWare, OrderController.getAllOrder)
router.put('/update-status', authMiddleWare,OrderController.updateOrderStatus);
router.put('/mark-as-received', authUserMiddleWare,OrderController.markOrderAsReceived);

router.get('/revenue-by-month', authMiddleWare, OrderController.getRevenueByMonth);
router.get('/available-years', OrderController.getAvailableYears);
router.get('/available-months', OrderController.getAvailableMonths);
router.get('/annual-revenue', OrderController.getAnnualRevenue);
module.exports = router