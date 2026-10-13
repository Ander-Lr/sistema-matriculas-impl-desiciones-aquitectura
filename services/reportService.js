import { readPagination } from "../validators/common.js";
import { getReportData } from "../models/reportModel.js";

const getReport = async (query = {}) => {
  const { q, limit, offset } = readPagination(query);
  return getReportData(q, limit, offset);
};

export { getReport };
