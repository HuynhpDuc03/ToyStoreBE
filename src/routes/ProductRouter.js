const express = require("express");
const router = express.Router()
const ProductController = require('../controllers/ProductController');
const { authMiddleWare } = require("../middleware/authMiddleware");

router.post('/create', ProductController.createProduct)
router.put('/update/:id', authMiddleWare, ProductController.updateProduct)
router.get('/get-details/:id', ProductController.getDetailsProduct)
router.delete('/delete/:id', authMiddleWare, ProductController.deleteProduct)
router.get('/get-all', ProductController.getAllProduct)
router.get('/get-all-admin', ProductController.getAllProductAdmin)
router.get('/get-search', ProductController.getSearchProduct)
router.post('/delete-many', authMiddleWare, ProductController.deleteMany)
router.get('/get-all-type', ProductController.getAllType)
router.get('/get-SpecialProducts', ProductController.getAllSpecialProducts)
router.get('/get-ProductRelated', ProductController.getProductRelated)

module.exports = router