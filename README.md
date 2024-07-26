# WallaClone Backend

Este es el backend del proyecto WallaClone, una plataforma de compraventa de artículos de segunda mano.

## Configuración del entorno de desarrollo

1. Clona el repositorio:
git clone https://github.com/psychohub/wallaclone-back.git
cd wallaclone-back

2. Instala las dependencias:
   npm install
  
3. Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables:
PORT=3000
MONGODB_URI=mongodb://localhost:27017/wallaclone
JWT_SECRET=eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcyMTQxNTQ5OCwiaWF0IjoxNzIxNDE1NDk4fQ.DG_-L4a-Hv26nmo7VoIE4zPTDP4jsnYzBwNaAW2_QD0

4. Inicia el servidor de desarrollo:
npm run dev

5. El servidor estará corriendo en `http://localhost:3000`.

## Scripts disponibles

- `npm start`: Inicia el servidor en modo producción.
- `npm run dev`: Inicia el servidor en modo desarrollo con hot-reloading.
- `npm run build`: Compila el proyecto TypeScript.
- `npm run lint`: Ejecuta el linter para verificar el estilo del código.
- `npm run lint:fix`: Corrige automáticamente los problemas de estilo que puede solucionar.

## Estructura del proyecto

src/
config/     # Configuraciones (base de datos, etc.)
controllers/# Controladores de la lógica de negocio
models/     # Modelos de MongoDB
routes/     # Definiciones de rutas
middleware/ # Middleware personalizado
utils/      # Funciones de utilidad
app.ts      # Configuración de la aplicación Express
server.ts   # Punto de entrada del servidor

3. La conexión a la base de datos se establece automáticamente al iniciar la aplicación.

### Modelos de Datos

Se han definido los siguientes modelos en Mongoose:

- Usuario
- Anuncio
- Chat
- Mensaje
- Notificación
- Transacción

Puedes encontrar las definiciones de estos modelos en la carpeta `src/models/`.

### Uso de los Modelos

Para utilizar los modelos en tus controladores o servicios, importalos de la siguiente manera:

```typescript
import Usuario from '../models/Usuario';
import Anuncio from '../models/Anuncio';
import Anuncio from '../models/Chat';
import Anuncio from '../models/Mensaje';
import Anuncio from '../models/Notificacion';

Manejo de Errores
-----------------

Se implementó un sistema de manejo de errores utilizando clases de error personalizadas. Estas clases se encuentran en src/utils/errors.ts e incluyen:

*   AppError: Error base personalizado
    
*   NotFoundError: Para recursos no encontrados (404)
    
*   BadRequestError: Para solicitudes inválidas (400)
    
*   UnauthorizedError: Para errores de autenticación (401)
    
*   ForbiddenError: Para errores de autorización (403)
    
*   ConflictError: Para conflictos con el estado actual (409)
    

Para usar estos errores en tus controladores:

import { BadRequestError, NotFoundError } from '../utils/errors';

// ...

if (algunaCondicion) {
  throw new BadRequestError('Mensaje de error');
}

Documentación API
-----------------

La documentación de la API está disponible a través de Swagger UI. Puedes acceder a ella en:

http://localhost:3000/api-docs


Seguridad
---------

Se ha  implementado varias medidas de seguridad:

*   Uso de Helmet para proteger la aplicación configurando varios encabezados HTTP
    
*   Implementación de CORS para controlar el acceso desde diferentes orígenes
    
*   Uso de bcrypt para el hash de contraseñas
    
*   Autenticación mediante JWT (JSON Web Tokens)
    

Logging
-------

Utiliza Morgan para el logging de las solicitudes HTTP, lo que facilita el debugging y monitoreo del servidor.

## Scripts Importantes

generateAdsData.ts

Este script genera datos de anuncios en la base de datos. Para ejecutarlo:

npm run generateAdsData

ts-node ./src/scripts/generateAdsData.ts

initDB.ts

Este script inicializa la base de datos. Elimina todos los datos existentes y los carga nuevamente a partir de un archivo JSON. Para ejecutarlo:

npm run initDB

ts-node ./src/scripts/initDB.ts

## Controladores

anuncioController.ts

Este controlador maneja las operaciones relacionadas con los anuncios. Implementa las siguientes funcionalidades:

getAnuncios: Obtiene una lista de anuncios con paginación. Utiliza el operador de agregación $facet de MongoDB para obtener los anuncios paginados y el total de anuncios en una sola consulta. También realiza un lookup para incluir la información del autor de cada anuncio.

uploadImages: Maneja la carga y compresión de imágenes. Utiliza sharp para redimensionar y comprimir las imágenes subidas y redis para almacenar en caché las imágenes.

Pruebas con Jest

anuncioController.test.ts

Se ha actualizado para probar las nuevas funcionalidades del controlador de anuncios:

Lista vacía de anuncios: Verifica que la API retorne una lista vacía cuando no hay anuncios en la base de datos.

Anuncios con paginación: Verifica que la API retorne anuncios correctamente paginados.

Manejo de errores: Verifica que la API maneje los errores correctamente, retornando un estado 500 en caso de error.

Rutas Estáticas para Servir Imágenes

El servidor ahora sirve imágenes de manera estática desde la carpeta public. Además, se ha añadido una ruta específica para servir imágenes almacenadas en el servidor.

Archivos Importantes

app.ts

Este archivo configura la aplicación Express. Incluye middleware de seguridad, manejo de CORS, logging, y configuración de rutas. También configura la documentación Swagger y el manejo global de errores.

server.ts

Este archivo es el punto de entrada del servidor. Conecta a la base de datos y levanta el servidor en el puerto especificado.



## Contribución al Proyecto

Para contribuir a este proyecto, sigue estos pasos:

1. Crea una nueva rama desde 'develop' con un nombre descriptivo (ej. `feature/nueva-funcionalidad` o `bugfix/correccion-error`).

2. Realiza tus cambios en esta rama.

3. Haz commit de tus cambios con mensajes claros y descriptivos.

4. Haz push de tu rama al repositorio.

5. Crea un Pull Request (PR) para fusionar tu rama en 'develop'.

6. Espera la revisión de código. Puede que se te pida realizar cambios.

7. Una vez aprobado, tu PR será fusionado en 'develop'.

Notas importantes:
- No hagas push directamente a las ramas 'main' o 'develop'.
- Asegúrate de que tu código pase todas las pruebas antes de crear un PR.
- Mantén tus PRs lo más pequeños y enfocados posible para facilitar la revisión.
