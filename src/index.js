const { conectarDB, cerrarDB } = require("./config/database");
const { crearServicioReservas } = require("./servicios/reservas");
const { crearControladorReservas } = require("./controladores/reservas");
const { crearApp } = require("./app");
const { configuracion } = require("./configuracion");

let servidor; //cuando se levante a express se guarda la referencia ahí

async function iniciarServidor() {
  try {
    const db = await conectarDB();

    const servicio = crearServicioReservas(db);
    const controlador = crearControladorReservas(servicio);

    const app = crearApp({
      controlador,
      servicio,
      entorno: configuracion.entorno,
    });

    servidor = app.listen(configuracion.puerto, () => {
      console.log(
        `Servidor escuchando en http://localhost:${configuracion.puerto}`,
      );
    });
  } catch (error) {
    console.error("No se pudo iniciar la aplicación:", error.message);
    process.exitCode = 1; //aquí hago esto para avisarle a Node que la app falló al arrancar
  }
}

async function detenerServidor() {
  console.log("\nCerrando aplicación...");

  try {
    if (servidor) {
      //aquí envolví en una promesa para poder esperarlo limpiamente con await ya q Node utiliza callbacks antiguos.
      //básicamente para que el código sea mpas legible y para que el servidor no se quede trabado, que vaya atendiendo a los demás clientes hasta tener listos datos
      await new Promise((resolve, reject) => {
        servidor.close((error) => {
          if (error) {
            reject(error); //si hay error destraba el await y va a saltar directamente al catch
          } else {
            resolve();
          }
        });
      });
    }

    await cerrarDB();

    process.exit(0); //este avisa que el proceso se cerró correctamente, el 0 sig que no hay errores
  } catch (error) {
    console.error("Error al cerrar la aplicación:", error.message);
    process.exit(1);
  }
}

process.on("SIGINT", detenerServidor);
process.on("SIGTERM", detenerServidor);

iniciarServidor();
