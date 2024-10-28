const ProductService = require('../services/ProductService')

const createProduct = async (req, res) => {
    try {
        const { name, image, type, countInStock, price, rating, description, discount } = req.body
        if (
            name === undefined || name === null ||
            image === undefined || image === null ||
            type === undefined || type === null ||
            countInStock === undefined || countInStock === null ||
            price === undefined || price === null ||
            rating === undefined || rating === null ||
            discount === undefined || discount === null
        ) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required'
            })
        }
        const response = await ProductService.createProduct(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e.message
        })
    }
}



const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id
        const data = req.body
        if (!productId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The productId is required'
            })
        }
        const response = await ProductService.updateProduct(productId, data)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const getDetailsProduct = async (req, res) => {
    try {
        const productId = req.params.id
        if (!productId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The productId is required'
            })
        }
        const response = await ProductService.getDetailsProduct(productId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id
        if (!productId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The productId is required'
            })
        }
        const response = await ProductService.deleteProduct(productId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const deleteMany = async (req, res) => {
    try {
        const ids = req.body.ids
        if (!ids) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The ids is required'
            })
        }
        const response = await ProductService.deleteManyProduct(ids)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}



const getAllProduct = async (req, res) => {
    try {
        const { limit, page, sort, filter } = req.query;

        let filters = [];
        if (filter) {
            if (Array.isArray(filter)) {
                filters = filter;
            } else {
                filters = [filter];
            }
        }

        const response = await ProductService.getAllProduct(Number(limit) || null, Number(page) || 0, sort, filters);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e
        });
    }
};







const getAllType = async (req, res) => {
    try {
        const response = await ProductService.getAllType()
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const getAllSpecialProducts = async (req, res) => {
    try {
        const { limit } = req.query
        const response = await ProductService.getAllSpecialProducts(Number(limit) || null)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(500).json({
            message: "Đã xảy ra lỗi, vui lòng thử lại sau."
        });
    }
}

module.exports = {
    createProduct,
    updateProduct,
    getDetailsProduct,
    deleteProduct,
    getAllProduct,
    deleteMany,
    getAllType,
    getAllSpecialProducts
}

// const getAllProduct = async (req, res) => {
//     try {
//         const { limit, page, sort, filter } = req.query
//         const response = await ProductService.getAllProduct(Number(limit) || null, Number(page) || 0, sort, filter)
//         return res.status(200).json(response)
//     } catch (e) {
//         return res.status(404).json({
//             message: e
//         })
//     }
// }


//cach 2