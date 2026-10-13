import * as reportService from "../services/reportService.js";

const getReport = async (req, res, next) => {
  try {
    res.json(await reportService.getReport(req.query));
  } catch (error) {
    next(error);
  }
};

export { getReport };
