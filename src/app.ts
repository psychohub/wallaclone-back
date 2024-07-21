import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger.json';
import morgan from 'morgan';
import helmet from 'helmet';
import { AppError, NotFoundError } from './utils/errors';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
app.use(helmet()); // Middleware de seguridad
app.use(morgan('dev')); // Middleware de logging
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'"
  );
  next();
});

app.use(express.json());

// Conectar a la base de datos
connectDB();

// Rutas
app.use('/api/auth', authRoutes);

// Swagger setup 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de Wallaclone');
});

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  next(new NotFoundError());
});

// Manejo de errores global
app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  
  const status = err.status || 500;
  const message = err.message || 'Algo salió mal';
  
  res.status(status).json({
    success: false,
    status,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

export default app;