const { validarDatosReserva } = require("../modelos/reserva");

function crearControladorApiReservas(servicio) {
  const salasValidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];

  async function listar(req, res) {
    const parametrosPermitidos = ["sala", "orden", "pagina", "limite"];

    const parametrosRecibidos = Object.keys(req.query);

    if (
      parametrosRecibidos.some(
        (parametro) => !parametrosPermitidos.includes(parametro),
      )
    ) {
      return res.status(400).json({
        error: "La solicitud contiene parámetros no permitidos.",
      });
    }

    const sala = req.query.sala;
    const orden = req.query.orden ?? "estudiante";
    const paginaTexto = req.query.pagina ?? "1";
    const limiteTexto = req.query.limite ?? "2";

    if (Array.isArray(sala)) {
      return res.status(400).json({
        error: "El parámetro sala debe enviarse una sola vez.",
      });
    }

    let salaLimpia;

    if (sala !== undefined) {
      if (typeof sala !== "string" || sala.trim() === "") {
        return res.status(400).json({
          error: "El parámetro sala debe ser un texto no vacío.",
        });
      }

      salaLimpia = sala.trim();

      if (!salasValidas.includes(salaLimpia)) {
        return res.status(400).json({
          error: "La sala indicada no es válida.",
        });
      }
    }

    const ordenesValidos = ["estudiante", "personas-asc", "personas-desc"];

    if (typeof orden !== "string" || !ordenesValidos.includes(orden)) {
      return res.status(400).json({
        error: "El orden indicado no es válido.",
      });
    }

    if (typeof paginaTexto !== "string" || !/^\d+$/.test(paginaTexto)) {
      return res.status(400).json({
        error: "La página debe ser un número entero válido.",
      });
    }

    const pagina = Number(paginaTexto);

    if (!Number.isInteger(pagina) || pagina < 1 || pagina > 1000) {
      return res.status(400).json({
        error: "La página debe estar entre 1 y 1000.",
      });
    }

    if (typeof limiteTexto !== "string" || !/^\d+$/.test(limiteTexto)) {
      return res.status(400).json({
        error: "El límite debe ser un número entero válido.",
      });
    }

    const limite = Number(limiteTexto);

    if (!Number.isInteger(limite) || limite < 1 || limite > 20) {
      return res.status(400).json({
        error: "El límite debe estar entre 1 y 20.",
      });
    }

    const reservas = await servicio.consultar(
      salaLimpia,
      orden,
      pagina,
      limite,
    );

    res.status(200).json(reservas);
  }

  async function buscarPorId(req, res) {
    const id = req.params.id;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({
        error: "El identificador no tiene un formato válido.",
      });
    }

    const reserva = await servicio.buscarPorId(id);

    if (!reserva) {
      return res.status(404).json({
        error: "No se encontró la reserva solicitada.",
      });
    }

    res.status(200).json(reserva);
  }

  async function crear(req, res) {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({
        error: "El cuerpo de la solicitud debe ser un objeto JSON.",
      });
    }

    const datos = {
      estudiante: req.body.estudiante,
      email: req.body.email,
      sala: req.body.sala,
      fecha: req.body.fecha,
      turno: req.body.turno,
      personas: req.body.personas,
    };

    const errores = validarDatosReserva(datos);

    if (errores.length > 0) {
      return res.status(400).json({
        error: errores.join(" "),
      });
    }

    const reserva = await servicio.crear(datos);

    res.status(201).location(`/api/reservas/${reserva.id}`).json(reserva);
  }

  // Reemplazar una reserva completa
  async function reemplazar(req, res) {
    const id = req.params.id;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({
        error: "El identificador no tiene un formato válido.",
      });
    }

    const errores = validarDatosReserva(req.body);

    if (errores.length > 0) {
      return res.status(400).json({
        error: errores.join(" "),
      });
    }

    const reserva = await servicio.reemplazar(id, req.body);

    if (!reserva) {
      return res.status(404).json({
        error: "No se encontró la reserva solicitada.",
      });
    }

    res.status(200).json(reserva);
  }

  // Modificar algunos campos de una reserva
  async function modificar(req, res) {
    const id = req.params.id;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({
        error: "El identificador no tiene un formato válido.",
      });
    }

    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body) ||
      Object.keys(req.body).length === 0
    ) {
      return res.status(400).json({
        error: "Debe enviar al menos un campo para modificar.",
      });
    }

    const camposPermitidos = [
      "estudiante",
      "email",
      "sala",
      "fecha",
      "turno",
      "personas",
    ];

    const camposRecibidos = Object.keys(req.body);

    if (camposRecibidos.some((campo) => !camposPermitidos.includes(campo))) {
      return res.status(400).json({
        error: "La solicitud contiene campos no permitidos.",
      });
    }

    const datos = {};

    for (const campo of camposPermitidos) {
      if (Object.hasOwn(req.body, campo)) {
        datos[campo] = req.body[campo];
      }
    }

    const reserva = await servicio.modificar(id, datos);

    if (!reserva) {
      return res.status(404).json({
        error: "No se encontró la reserva solicitada.",
      });
    }

    res.status(200).json(reserva);
  }

  // Eliminar una reserva
  async function eliminar(req, res) {
    const id = req.params.id;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({
        error: "El identificador no tiene un formato válido.",
      });
    }

    const eliminada = await servicio.eliminar(id);

    if (!eliminada) {
      return res.status(404).json({
        error: "No se encontró la reserva solicitada.",
      });
    }

    res.status(204).send();
  }

  return {
    listar,
    buscarPorId,
    crear,
    reemplazar,
    modificar,
    eliminar,
  };
}

module.exports = {
  crearControladorApiReservas,
};
