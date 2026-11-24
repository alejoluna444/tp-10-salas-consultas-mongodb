const express = require("express");

function crearRouterApiReservas(controlador) {
  const router = express.Router();

  // Consultar reservas
  router.get("/", controlador.listar);

  // Consultar una reserva por ID
  router.get("/:id", controlador.buscarPorId);

  // Crear una reserva
  router.post("/", controlador.crear);

  // Reemplazar una reserva completa
  router.put("/:id", controlador.reemplazar);

  // Modificar algunos campos
  router.patch("/:id", controlador.modificar);

  // Eliminar una reserva
  router.delete("/:id", controlador.eliminar);

  return router;
}

module.exports = {
  crearRouterApiReservas,
};
