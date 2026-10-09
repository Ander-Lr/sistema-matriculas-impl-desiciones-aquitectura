const reporteService = require("../services/reporteService");

const getReporte = (req, res) => {
  const reporte = reporteService.getReporte();
  res.json(reporte);
};

module.exports = {
  getReporte
};
