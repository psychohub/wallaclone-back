import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wallaclone';

const startServer = async () => {
  await connectDB(MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log('Environment variables:');
    console.log('PORT:', process.env.PORT);
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
  });
};

startServer();
