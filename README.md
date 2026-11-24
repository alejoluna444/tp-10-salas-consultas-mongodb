# TP 10 - Salas: consultas con MongoDB

Aplicación web para gestionar reservas de salas de estudio mediante Node.js, Express y MongoDB Atlas.

El proyecto permite realizar operaciones CRUD sobre las reservas e incorpora consultas con filtros, ordenamiento, paginación y proyección de campos.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- EJS
- express-ejs-layouts
- Morgan
- dotenv
- ESLint
- Prettier

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

## Configuración

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`.

Configurar las siguientes variables:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=TU_URI_DE_MONGODB_ATLAS
```

Reemplazar `TU_URI_DE_MONGODB_ATLAS` por la cadena de conexión correspondiente a MongoDB Atlas.

La aplicación utiliza la base de datos `reservas_salas_u10` y la colección `reservas`.

**Importante:** El archivo `.env` contiene información privada y no debe subirse a GitHub.

## Ejecución

Iniciar el servidor:

```bash
npm start
```

La aplicación queda disponible en:

http://localhost:3000

## Endpoints de la API

La API permite realizar operaciones CRUD sobre las reservas.

| Método | Endpoint | Función |
|---|---|---|
| GET | `/api/reservas` | Consultar reservas |
| GET | `/api/reservas/:id` | Buscar una reserva por ID |
| POST | `/api/reservas` | Crear una reserva |
| PUT | `/api/reservas/:id` | Reemplazar una reserva |
| PATCH | `/api/reservas/:id` | Modificar parcialmente una reserva |
| DELETE | `/api/reservas/:id` | Eliminar una reserva |

## Consultas de reservas

El endpoint `GET /api/reservas` permite realizar consultas utilizando parámetros.

### Filtro por sala

El parámetro `sala` permite consultar las reservas de una sala determinada.

Salas disponibles:

- `Sala Norte`
- `Sala Sur`
- `Sala Multimedia`

Ejemplo:

```http
GET /api/reservas?sala=Sala%20Norte
```

### Ordenamiento

El parámetro `orden` permite establecer el criterio de ordenamiento.

Opciones disponibles:

| Valor | Orden |
|---|---|
| `estudiante` | Alfabético por nombre del estudiante |
| `personas-asc` | Cantidad de personas de menor a mayor |
| `personas-desc` | Cantidad de personas de mayor a menor |

Si no se especifica, se utiliza `estudiante` como orden predeterminado.

Ejemplo:

```http
GET /api/reservas?orden=personas-desc
```

### Paginación

La API permite dividir los resultados en páginas.

| Parámetro | Descripción | Valor predeterminado | Rango permitido |
|---|---|---|---|
| `pagina` | Número de página solicitada | 1 | 1 a 1000 |
| `limite` | Cantidad de reservas por página | 2 | 1 a 20 |

Ejemplo:

```http
GET /api/reservas?pagina=2&limite=3
```

### Combinación de consultas

Los parámetros pueden combinarse para realizar consultas más específicas.

Ejemplo:

```http
GET /api/reservas?sala=Sala%20Norte&orden=personas-desc&pagina=1&limite=2
```

Esta consulta obtiene las reservas de Sala Norte, ordenadas por cantidad de personas de mayor a menor, mostrando dos resultados por página.

### Proyección de campos

La consulta utiliza una proyección de MongoDB para recuperar solamente los campos necesarios:

- `estudiante`
- `email`
- `sala`
- `fecha`
- `turno`
- `personas`
- `estado`

El identificador de MongoDB (`_id`) se conserva internamente para generar el campo público `id`.

La respuesta de la API no expone `_id` ni `__v`.

### Formato de respuesta

La consulta devuelve un objeto JSON con los resultados y los datos de paginación.

Ejemplo:

```json
{
  "datos": [
    {
      "id": "identificador",
      "estudiante": "Ana Ejemplo",
      "email": "ana@example.com",
      "sala": "Sala Norte",
      "fecha": "2026-10-28",
      "turno": "Mañana",
      "personas": 2,
      "estado": "pendiente"
    }
  ],
  "pagina": 1,
  "limite": 2,
  "total": 6,
  "paginas": 3
}
```

### Validaciones de consultas

La API valida los parámetros recibidos:

- Solamente acepta `sala`, `orden`, `pagina` y `limite`.
- No permite parámetros repetidos.
- Verifica que la sala sea válida.
- Verifica que el ordenamiento sea una opción permitida.
- Comprueba que la página y el límite sean números enteros.
- Controla los rangos permitidos para la página y el límite.

Cuando los parámetros no son válidos, devuelve una respuesta HTTP 400 con un mensaje de error.

## Datos de una reserva

Una reserva contiene los siguientes campos:

- `estudiante`: nombre del estudiante.
- `email`: correo electrónico.
- `sala`: sala seleccionada.
- `fecha`: fecha de la reserva.
- `turno`: turno seleccionado.
- `personas`: cantidad de personas.
- `estado`: estado de la reserva.

## Validaciones de reservas

El sistema valida:

- Que el estudiante tenga un nombre.
- Que el correo electrónico tenga un formato válido.
- Que la sala seleccionada sea válida.
- Que la fecha esté informada.
- Que el turno sea válido.
- Que la cantidad de personas sea un número entero entre 1 y 6.

Si los datos no son válidos, la API devuelve una respuesta de error.

## Persistencia de datos

Las reservas se almacenan en MongoDB Atlas mediante el paquete `mongodb`.

Los datos permanecen guardados aunque se detenga y vuelva a iniciar el servidor.

## Comandos disponibles

```bash
npm start
npm run format
npm run format:check
npm run lint
npm run check
```

El comando `npm run check` permite verificar el formato del código y ejecutar ESLint.

## Funcionamiento

La aplicación permite:

- Consultar la página de inicio.
- Consultar el estado de la aplicación.
- Listar las reservas.
- Consultar una reserva por su identificador.
- Crear nuevas reservas.
- Reemplazar reservas existentes.
- Modificar parcialmente una reserva.
- Eliminar reservas.
- Filtrar reservas por sala.
- Ordenar los resultados.
- Paginar las consultas.
- Seleccionar los campos devueltos mediante proyección.
- Validar los datos recibidos.
- Manejar errores y solicitudes de recursos inexistentes.
