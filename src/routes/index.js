const UserRouter = require("./UserRouter");
const ProductRoute = require("./ProductRouter");
const OrderRouter = require("./OrderRouter");
const CouponRouter = require("./CouponRouter");
const BlogRouter = require("./BlogRouter");
const DashboardRouter = require("./DashboardRouter");
const RatingRouter = require("./RatingRouter");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRoute);
  app.use("/api/order", OrderRouter);
  app.use("/api/coupon", CouponRouter);
  app.use("/api/blog", BlogRouter);
  app.use("/api/rating", RatingRouter);
  app.use("/api/dashboard", DashboardRouter);
};

module.exports = routes;
