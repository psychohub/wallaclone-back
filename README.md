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


## Contribuir

Por favor, asegúrate de seguir las guías de estilo ejecutando `npm run lint` antes de hacer commit de tus cambios.
