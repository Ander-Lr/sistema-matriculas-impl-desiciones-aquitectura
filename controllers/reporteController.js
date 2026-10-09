import * as reporteService from "../services/reporteService.js";

const getReporte = async (req, res) => {
  const reporte = await reporteService.getReporte();
  res.json(reporte);
};

export { 
  getReporte
 };
