const express = require("express");
const router = express.Router()
const OrderController = require('../controllers/OrderController');
const { authUserMiddleWare, authMiddleWare } = require("../middleware/authMiddleware");


router.post('/create', authUserMiddleWare, OrderController.createOrder)
router.get('/get-all-order-details/:id',authUserMiddleWare, OrderController.getAllOrderDetails)
router.get('/get-details-order/:id', authUserMiddleWare, OrderController.getDetailsOrder)
router.delete('/cancel-order/:id',authUserMiddleWare, OrderController.cancelOrderDetails)
router.get('/get-all-order', OrderController.getAllOrder)
router.put('/update-status', authMiddleWare,OrderController.updateOrderStatus);
router.put('/mark-as-received', authUserMiddleWare,OrderController.markOrderAsReceived);
module.exports = router