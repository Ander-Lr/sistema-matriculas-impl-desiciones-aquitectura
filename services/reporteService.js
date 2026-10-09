import { getReporteData } from "../models/reporteModel.js";

const getReporte = async (query = {}) => {
  const q = query.q || "";
  const limit = parseInt(query.limit) || 10;
  const offset = parseInt(query.offset) || 0;
  return await getReporteData(q, limit, offset);
};

export { getReporte };