import { leerPaginacion } from "../validators/comun.js";
import { getReporteData } from "../models/reporteModel.js";

const getReporte = async (query = {}) => {
  const { q, limit, offset } = leerPaginacion(query);
  return await getReporteData(q, limit, offset);
};

export { getReporte };