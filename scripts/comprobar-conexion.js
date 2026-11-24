const { conectarDB, cerrarDB } = require("../src/config/database");

async function comprobarConexion() {
  try {
    const db = await conectarDB();

    console.log("Base de datos seleccionada:", db.databaseName);
    console.log("Comprobación de conexión finalizada correctamente");
  } catch (error) {
    console.error("No se pudo comprobar la conexión:", error.message);
    process.exitCode = 1;
  } finally {
    await cerrarDB();
  }
}

comprobarConexion();