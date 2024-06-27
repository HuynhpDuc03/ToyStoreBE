const Product = require("../models/ProductModel")

const createProduct = (newProduct) => {
    return new Promise(async (resolve, reject) => {
        const { name, image, type, countInStock, price, rating, description,discount } = newProduct
        try {
            const checkProduct = await Product.findOne({
                name: name
            })
            if (checkProduct !== null) {
                resolve({
                    status: 'ERR',
                    message: 'The name of product is already'
                })
            }
            const newProduct = await Product.create({
                name, 
                image, 
                type, 
                countInStock: Number(countInStock), 
                price, 
                rating, 
                description,
                discount: Number(discount),
            })
            if (newProduct) {
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: newProduct
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

const updateProduct = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkProduct = await Product.findOne({
                _id: id
            })
            if (checkProduct === null) {
                resolve({
                    status: 'ERR',
                    message: 'The product is not defined'
                })
            }

            const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true })
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: updatedProduct
            })
        } catch (e) {
            reject(e)
        }
    })
}

const deleteProduct = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkProduct = await Product.findOne({
                _id: id
            })
            if (checkProduct === null) {
                resolve({
                    status: 'ERR',
                    message: 'The product is not defined'
                })
            }

            await Product.findByIdAndDelete(id)
            resolve({
                status: 'OK',
                message: 'Delete product success',
            })
        } catch (e) {
            reject(e)
        }
    })
}

const deleteManyProduct = (ids) => {
    return new Promise(async (resolve, reject) => {
        try {
            await Product.deleteMany({ _id: ids })
            resolve({
                status: 'OK',
                message: 'Delete product success',
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getDetailsProduct = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await Product.findOne({
                _id: id
            })
            if (product === null) {
                resolve({
                    status: 'ERR',
                    message: 'The product is not defined'
                })
            }

            resolve({
                status: 'OK',
                message: 'SUCESS',
                data: product
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getAllProduct = (limit, page, sort, filters) => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = {};

            // Sử dụng bộ lọc
            if (filters && Array.isArray(filters)) {
                filters.forEach(filter => {
                    const [key, value] = filter.split('=');
                    if (key && value) {
                        if (key === 'type') {
                            query.type = value;
                        } else if (key === 'name') {
                            query.name = { $regex: value, $options: 'i' };
                        } else if (key === 'price') {
                            const [min, max] = value.split('-').map(Number);
                            query.price = {};
                            if (min) query.price.$gte = min;
                            if (max) query.price.$lte = max;
                        } else {
                            query[key] = { $regex: value, $options: 'i' };
                        }
                    }
                });
            }

            // Sắp xếp
            let sortOrder = {};
            if (sort) {
                if (sort === 'lowtohigh') {
                    sortOrder = { price: 1 };
                } else if (sort === 'hightolow') {
                    sortOrder = { price: -1 };
                } else if (sort === 'name-asc') {
                    sortOrder = { name: 1 };
                } else if (sort === 'name-desc') {
                    sortOrder = { name: -1 };
                } else if (sort === 'bestSeller') {
                    query.bestSeller = true;
                } else if (sort === 'hotSale') {
                    query.hotSale = true;
                } else if (sort === 'newArrivals') {
                    query.newArrivals = true;
                }
            }

            const totalProduct = await Product.countDocuments(query);
            let products = [];

            if (!limit) {
                products = await Product.find(query).sort(sortOrder).sort({ createdAt: -1, updatedAt: -1 });
            } else {
                products = await Product.find(query)
                    .sort(sortOrder)
                    .sort({ createdAt: -1, updatedAt: -1 })
                    .skip(page * limit)
                    .limit(limit);
            }

            resolve({
                status: 'OK',
                message: 'Success',
                data: products,
                total: totalProduct,
                pageCurrent: Number(page + 1),
                totalPage: Math.ceil(totalProduct / limit)
            });
        } catch (e) {
            reject(e);
        }
    });
};







const getAllType = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allType = await Product.distinct('type')
            resolve({
                status: 'OK',
                message: 'Success',
                data: allType,
            })
        } catch (e) {
            reject(e)
        }
    })
}
const getAllBestSellerProduct = (limit) => {
    return new Promise(async (resolve, reject) => {
        try {
            const allProduct = await Product.find({ bestSeller: true }).limit(limit).sort({createdAt: -1, updatedAt: -1})
            resolve({
                status: 'OK',
                message: 'Success',
                data: allProduct,
                total: allProduct.length,
            })
        } catch (e) {
            reject(e)
        }
    })
}
module.exports = {
    createProduct,
    updateProduct,
    getDetailsProduct,
    deleteProduct,
    getAllProduct,
    deleteManyProduct,
    getAllType,
    getAllBestSellerProduct
}



// const getAllProduct = (limit, page, sort, filter) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const totalProduct = await Product.countDocuments()
//             let allProduct = []
//             if (filter) {
//                 const label = filter[0];
//                 const allObjectFilter = await Product.find({ [label]: { '$regex': filter[1] } }).limit(limit).skip(page * limit).sort({createdAt: -1, updatedAt: -1})
//                 resolve({
//                     status: 'OK',
//                     message: 'Success',
//                     data: allObjectFilter,
//                     total: totalProduct,
//                     pageCurrent: Number(page + 1),
//                     totalPage: Math.ceil(totalProduct / limit)
//                 })
//             }
//             if (sort) {
//                 const objectSort = {}
//                 objectSort[sort[1]] = sort[0]
//                 const allProductSort = await Product.find().limit(limit).skip(page * limit).sort(objectSort).sort({createdAt: -1, updatedAt: -1})
//                 resolve({
//                     status: 'OK',
//                     message: 'Success',
//                     data: allProductSort,
//                     total: totalProduct,
//                     pageCurrent: Number(page + 1),
//                     totalPage: Math.ceil(totalProduct / limit)
//                 })
//             }
//             if(!limit) {
//                 allProduct = await Product.find().sort({createdAt: -1, updatedAt: -1})
//             }else {
//                 allProduct = await Product.find().limit(limit).skip(page * limit).sort({createdAt: -1, updatedAt: -1})
//             }
//             resolve({
//                 status: 'OK',
//                 message: 'Success',
//                 data: allProduct,
//                 total: totalProduct,
//                 pageCurrent: Number(page + 1),
//                 totalPage: Math.ceil(totalProduct / limit)
//             })
//         } catch (e) {
//             reject(e)
//         }
//     })
// }