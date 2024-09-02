import mongoose, { Document, Schema } from 'mongoose';
import { IUsuario } from './Usuario';
import { EstadosAnuncio } from '../utils/anuncio';

export interface IAnuncio extends Document {
  nombre: string;
  imagen: string;
  descripcion: string;
  precio: number;
  tipoAnuncio: 'venta' | 'búsqueda';
  tags: string[];
  autor: mongoose.Types.ObjectId;
  fechaPublicacion: Date;
  slug: string;
  estado: string;
}

const AnuncioSchema: Schema = new Schema({
  nombre: { type: String, required: true },
  imagen: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  tipoAnuncio: { type: String, enum: ['venta', 'búsqueda'], required: true },
  tags: [{ type: String }],
  autor: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fechaPublicacion: { type: Date, default: Date.now },
  slug: { type: String, required: true },
  estado: { type: String, required: true, default: EstadosAnuncio.DISPONIBLE },
});

export default mongoose.model<IAnuncio>('Anuncio', AnuncioSchema);
