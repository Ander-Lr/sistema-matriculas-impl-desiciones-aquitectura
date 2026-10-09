import * as reporteService from "../services/reporteService.js";

const getReporte = async (req, res, next) => {
  try {
    const reporte = await reporteService.getReporte(req.query);
    res.json(reporte);
  } catch (err) {
    next(err);
  }
};

export { getReporte };