const { ObjectId } = require("mongodb");
const { prepararReserva } = require("../modelos/reserva");

function crearServicioReservas(db) {
  const coleccion = db.collection("reservas");

  function convertirReserva(documento) {
    const { _id, ...datos } = documento;

    return {
      id: _id.toString(),
      ...datos,
    };
  }

  async function listar(sala) {
    const criterio = {};

    if (sala !== undefined) {
      criterio.sala = sala;
    }

    const documentos = await coleccion
      .find(criterio)
      .sort({ _id: 1 })
      .toArray();

    return documentos.map(convertirReserva);
  }

  async function consultar(sala, orden = "estudiante", pagina = 1, limite = 2) {
    const criterio = {};

    if (sala !== undefined) {
      criterio.sala = sala.trim();
    }

    const ordenesValidos = {
      estudiante: { estudiante: 1, _id: 1 },
      "personas-asc": { personas: 1, _id: 1 },
      "personas-desc": { personas: -1, _id: 1 },
    };

    const proyeccion = {
      estudiante: 1,
      email: 1,
      sala: 1,
      fecha: 1,
      turno: 1,
      personas: 1,
      estado: 1,
    };

    const total = await coleccion.countDocuments(criterio);
    const paginas = Math.ceil(total / limite);
    const saltar = (pagina - 1) * limite;

    const documentos = await coleccion
      .find(criterio, { projection: proyeccion })
      .sort(ordenesValidos[orden])
      .skip(saltar)
      .limit(limite)
      .toArray();

    return {
      datos: documentos.map(convertirReserva),
      pagina,
      limite,
      total,
      paginas,
    };
  }

  async function buscarPorId(id) {
    const documento = await coleccion.findOne({
      _id: new ObjectId(id),
    });

    if (!documento) {
      return null;
    }

    return convertirReserva(documento);
  }

  async function contar() {
    return await coleccion.countDocuments();
  }

  async function crear(datos) {
    const nuevaReserva = prepararReserva(datos);

    const resultado = await coleccion.insertOne(nuevaReserva);

    return {
      id: resultado.insertedId.toString(),
      ...nuevaReserva,
    };
  }

  // Reemplazar una reserva completa
  async function reemplazar(id, datos) {
    const nuevaReserva = prepararReserva(datos);

    const resultado = await coleccion.replaceOne(
      { _id: new ObjectId(id) },
      nuevaReserva,
    );

    if (resultado.matchedCount === 0) {
      return null;
    }

    return buscarPorId(id);
  }

  // Modificar algunos datos de una reserva
  async function modificar(id, datos) {
    const reservaActual = await buscarPorId(id);

    if (!reservaActual) {
      return null;
    }

    const datosActualizados = {
      estudiante: datos.estudiante ?? reservaActual.estudiante,
      email: datos.email ?? reservaActual.email,
      sala: datos.sala ?? reservaActual.sala,
      fecha: datos.fecha ?? reservaActual.fecha,
      turno: datos.turno ?? reservaActual.turno,
      personas: datos.personas ?? reservaActual.personas,
    };

    const reservaPreparada = prepararReserva(datosActualizados);

    await coleccion.updateOne(
      { _id: new ObjectId(id) },
      { $set: reservaPreparada },
    );

    return buscarPorId(id);
  }

  // Eliminar una reserva
  async function eliminar(id) {
    const resultado = await coleccion.deleteOne({
      _id: new ObjectId(id),
    });

    return resultado.deletedCount > 0;
  }

  return {
    listar,
    consultar,
    buscarPorId,
    contar,
    crear,
    reemplazar,
    modificar,
    eliminar,
  };
}

module.exports = {
  crearServicioReservas,
};
