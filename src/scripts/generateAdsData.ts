import fs from 'fs';
import path from 'path';
import { Types } from 'mongoose';
import mongoose from 'mongoose';
import Usuario from '../models/Usuario';
import Anuncio from '../models/Anuncio';
import { connectDB } from '../config/database';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface Anuncio {
  nombre: string;
  imagen: string;
  descripcion: string;
  precio: number;
  tipoAnuncio: 'venta' | 'búsqueda';
  tags: string[];
  autor: Types.ObjectId;
  fechaPublicacion: Date;
}

const usuariosData = [
  { nombre: 'usuario1', email: 'usuario1@example.com', contraseña: 'password1' },
  { nombre: 'usuario2', email: 'usuario2@example.com', contraseña: 'password2' },
  { nombre: 'usuario3', email: 'usuario3@example.com', contraseña: 'password3' },
  { nombre: 'usuario4', email: 'usuario4@example.com', contraseña: 'password4' },
  { nombre: 'usuario5', email: 'usuario5@example.com', contraseña: 'password5' },
  { nombre: 'usuario6', email: 'usuario6@example.com', contraseña: 'password6' },
  { nombre: 'usuario7', email: 'usuario7@example.com', contraseña: 'password7' },
  { nombre: 'usuario8', email: 'usuario8@example.com', contraseña: 'password8' },
  { nombre: 'usuario9', email: 'usuario9@example.com', contraseña: 'password9' },
  { nombre: 'usuario10', email: 'usuario10@example.com', contraseña: 'password10' },
];

const anunciosData: Partial<Anuncio>[] = [
  { nombre: 'Impresora 3D', imagen: '3d-printer.jpg', descripcion: 'Impresora 3D de alta precisión', precio: 1000, tipoAnuncio: 'venta', tags: ['tech', '3d'], fechaPublicacion: new Date() },
  { nombre: 'Monitor 4K', imagen: '4k-monitor.jpg', descripcion: 'Monitor 4K UHD de 27 pulgadas', precio: 400, tipoAnuncio: 'venta', tags: ['tech', 'monitor'], fechaPublicacion: new Date() },
  { nombre: 'Altavoces Bluetooth', imagen: 'bluetooth-speakers.jpg', descripcion: 'Altavoces portátiles Bluetooth con gran calidad de sonido', precio: 150, tipoAnuncio: 'venta', tags: ['tech', 'audio'], fechaPublicacion: new Date() },
  { nombre: 'Drone', imagen: 'drone.jpg', descripcion: 'Drone con cámara 4K y estabilizador', precio: 800, tipoAnuncio: 'venta', tags: ['tech', 'drone'], fechaPublicacion: new Date() },
  { nombre: 'Cámara DSLR', imagen: 'dslr-camera.jpg', descripcion: 'Cámara DSLR profesional, ideal para fotografía de paisajes.', precio: 600, tipoAnuncio: 'venta', tags: ['tech', 'photo'], fechaPublicacion: new Date() },
  { nombre: 'iPhone 12', imagen: 'iphone12.jpg', descripcion: 'iPhone 12 en excelente estado, poco uso.', precio: 500, tipoAnuncio: 'venta', tags: ['mobile', 'tech'], fechaPublicacion: new Date() },
  { nombre: 'MacBook Pro', imagen: 'macbook-pro.jpg', descripcion: 'MacBook Pro 2021, 16GB RAM, 512GB SSD.', precio: 1200, tipoAnuncio: 'venta', tags: ['tech', 'work'], fechaPublicacion: new Date() },
  { nombre: 'Teclado Mecánico', imagen: 'mechanical-keyboard.jpg', descripcion: 'Teclado mecánico retroiluminado', precio: 100, tipoAnuncio: 'venta', tags: ['tech', 'keyboard'], fechaPublicacion: new Date() },
  { nombre: 'Bicicleta de Montaña', imagen: 'mountain-bike.jpg', descripcion: 'Bicicleta de montaña casi nueva, ideal para principiantes.', precio: 300, tipoAnuncio: 'venta', tags: ['lifestyle', 'sports'], fechaPublicacion: new Date() },
  { nombre: 'Nintendo Switch', imagen: 'nintendo-switch.jpg', descripcion: 'Consola Nintendo Switch con juegos incluidos', precio: 350, tipoAnuncio: 'venta', tags: ['gaming', 'tech'], fechaPublicacion: new Date() },
  { nombre: 'Silla de Oficina', imagen: 'office-chair.jpg', descripcion: 'Silla ergonómica de oficina', precio: 200, tipoAnuncio: 'venta', tags: ['furniture', 'office'], fechaPublicacion: new Date() },
  { nombre: 'PlayStation 5', imagen: 'ps5.jpg', descripcion: 'PS5 nueva, en caja sellada.', precio: 450, tipoAnuncio: 'venta', tags: ['tech', 'gaming'], fechaPublicacion: new Date() },
  { nombre: 'Robot Aspiradora', imagen: 'robot-vacuum.jpg', descripcion: 'Robot aspiradora con programación automática', precio: 250, tipoAnuncio: 'venta', tags: ['home', 'tech'], fechaPublicacion: new Date() },
  { nombre: 'Smartwatch', imagen: 'smartwatch.jpg', descripcion: 'Reloj inteligente con monitor de salud', precio: 150, tipoAnuncio: 'venta', tags: ['tech', 'wearable'], fechaPublicacion: new Date() },
  { nombre: 'Tablet', imagen: 'tablet.jpg', descripcion: 'Tablet de 10 pulgadas con pantalla HD', precio: 200, tipoAnuncio: 'venta', tags: ['tech', 'tablet'], fechaPublicacion: new Date() },
  { nombre: 'Auriculares Inalámbricos', imagen: 'wireless-headphones.jpg', descripcion: 'Auriculares inalámbricos con cancelación de ruido', precio: 180, tipoAnuncio: 'venta', tags: ['tech', 'audio'], fechaPublicacion: new Date() },
];

const outputDir = path.join(__dirname, '../../data');
const outputPath = path.join(outputDir, 'anuncios.json');

const generateData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wallaclone';
    await connectDB(mongoUri);

    // Crear usuarios
    const usuarios = await Usuario.insertMany(usuariosData);
    console.log('Usuarios creados:', usuarios);

    // Asignar un autor a cada anuncio
    anunciosData.forEach((anuncio, index) => {
      anuncio.autor = usuarios[index % usuarios.length]._id as Types.ObjectId;
    });

    // Crear anuncios
    const anuncios = await Anuncio.insertMany(anunciosData);
    console.log('Anuncios creados:', anuncios);

    console.log('Datos generados correctamente');
    mongoose.disconnect(); // Cerrar la conexión
  } catch (error) {
    console.error('Error al generar datos:', error);
    mongoose.disconnect(); // Cerrar la conexión en caso de error
  }
};

generateData();
