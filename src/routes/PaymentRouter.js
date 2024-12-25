const express = require("express");
const router = express.Router()
const { createZaloPayOrder, handleZaloPayCallback } = require("../controllers/PaymentController");

router.post("/zalopay", createZaloPayOrder);
router.post("/callback", handleZaloPayCallback);

module.exports = router;