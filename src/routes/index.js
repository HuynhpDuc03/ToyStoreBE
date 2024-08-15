const UserRouter = require('./UserRouter');
const ProductRoute = require('./ProductRouter');
const OrderRouter = require('./OrderRouter');
const CouponRouter = require('./CouponRouter');

const routes = (app) => {
    app.use('/api/user', UserRouter)
    app.use('/api/product', ProductRoute)
    app.use('/api/order', OrderRouter)
    app.use('/api/coupon', CouponRouter)
}

module.exports = routes;