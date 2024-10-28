const DashboardService = require("../services/DashboardService");

const getRevenue = async (req, res) => {
  let { chartType, fromDate, toDate } = req.body;
  try {
    const response = await DashboardService.getRevenueByChartType(
      chartType,
      fromDate,
      toDate
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const response = await DashboardService.getDashboardSummary();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const getChartCategoryStock = async (req, res) => {
  try {
    const response = await DashboardService.getChartCategoryStock();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const getChartProductStock = async (req, res) => {
  try {
    const response = await DashboardService.getChartProductStock();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const getStockPercentage = async (req, res) => {
  try {
    const response = await DashboardService.getStockPercentage();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};
module.exports = {
  getRevenue,
  getDashboardSummary,
  getChartCategoryStock,
  getChartProductStock,
  getStockPercentage
};
