import mongoose, { Document, Schema } from 'mongoose';
import { IUsuario } from './Usuario';

export interface IAnuncio extends Document {
  nombre: string;
  imagen: string;
  descripcion: string;
  precio: number;
  tipoAnuncio: 'venta' | 'búsqueda';
  tags: string[];
  autor: IUsuario['_id']; 
  fechaPublicacion: Date;
}

const AnuncioSchema: Schema = new Schema({
  nombre: { type: String, required: true },
  imagen: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  tipoAnuncio: { type: String, enum: ['venta', 'búsqueda'], required: true },
  tags: [{ type: String }],
  autor: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fechaPublicacion: { type: Date, default: Date.now }
});

export default mongoose.model<IAnuncio>('Anuncio', AnuncioSchema);