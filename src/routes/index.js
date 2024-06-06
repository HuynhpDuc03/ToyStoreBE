const UserRouter = require('./UserRouter');
const ProductRoute = require('./ProductRouter');
const OrderRouter = require('./OrderRouter');

const routes = (app) => {
    app.use('/api/user', UserRouter)
    app.use('/api/product', ProductRoute)
    app.use('/api/order', OrderRouter)
}

module.exports = routes;