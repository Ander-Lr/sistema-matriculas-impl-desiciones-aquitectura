import { getReporteData } from "../models/reporteModel.js";

const getReporte = async () => {
  return await getReporteData();
};

export { getReporte };
