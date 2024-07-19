import mongoose, { Document, Schema } from 'mongoose';

interface IAnuncio extends Document {
  titulo: string;
  descripcion: string;
  precio: number;
  tipoAnuncio: 'venta' | 'búsqueda';
  estado: 'activo' | 'inactivo';
  estadoVenta: 'disponible' | 'reservado' | 'vendido';
  imagenes: string[];
  ubicacion: {
    latitud: number;
    longitud: number;
  };
  fechaPublicacion: Date;
  fechaActualizacion: Date;
  autor: mongoose.Schema.Types.ObjectId;
  tags: string[];
}

const AnuncioSchema: Schema = new Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  tipoAnuncio: { type: String, enum: ['venta', 'búsqueda'], required: true },
  estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' },
  estadoVenta: { type: String, enum: ['disponible', 'reservado', 'vendido'], default: 'disponible' },
  imagenes: [String],
  ubicacion: {
    latitud: Number,
    longitud: Number
  },
  fechaPublicacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now },
  autor: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  tags: [String]
});

export default mongoose.model<IAnuncio>('Anuncio', AnuncioSchema);