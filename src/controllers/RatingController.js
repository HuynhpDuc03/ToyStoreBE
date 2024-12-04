const RatingService = require("../services/RatingService");

const addRating = async (req, res) => {
  try {
    const { orderId,product, user, rating, comment, image } = req.body;
    const response = await RatingService.addRating({ orderId,product, user, rating, comment, image });
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERROR",
      message: e.message,
    });
  }
};
module.exports = {
    addRating,
  };