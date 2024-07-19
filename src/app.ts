import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();

app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
}));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wallaclone')
  .then(() => console.log('Conectado a MongoDB'))
  .catch((error) => console.error('Error al conectar a MongoDB:', error));

export default app;