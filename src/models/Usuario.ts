import mongoose, { Document, Schema } from 'mongoose';
import { comparePasswords, hashPassword } from '../utils/password';

export interface IUsuario extends Document {
  nombre: string;
  email: string;
  contraseña: string;
  fechaRegistro: Date;
  avatar?: string;
  anunciosFavoritos: Array<{
    anuncio: mongoose.Types.ObjectId;
    fechaAgregado: Date;
  }>;
  compararContraseña(contraseñaCandidata: string): Promise<boolean>;
  agregarFavorito(anuncioId: mongoose.Types.ObjectId): Promise<void>;
  eliminarFavorito(anuncioId: mongoose.Types.ObjectId): Promise<void>;
  listarFavoritos(): Array<{
    anuncio: mongoose.Types.ObjectId;
    fechaAgregado: Date;
  }>;
}

interface AnuncioFavorito {
  anuncio: mongoose.Types.ObjectId;
  fechaAgregado: Date;
}

const UsuarioSchema: Schema = new Schema({
  nombre: { 
    type: String, 
    required: true,
    match: /^[a-zA-Z0-9_-]+$/
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  contraseña: { 
    type: String, 
    required: true,
    minlength: 6
  },
  fechaRegistro: { type: Date, default: Date.now },
  avatar: String,
  anunciosFavoritos: [{
    anuncio: { type: Schema.Types.ObjectId, ref: 'Anuncio' },
    fechaAgregado: { type: Date, default: Date.now }
  }]
});

UsuarioSchema.pre<IUsuario>('save', async function(next) {
  if (!this.isModified('contraseña')) return next();
  this.contraseña = await hashPassword(this.contraseña);
  next();
});

UsuarioSchema.methods.compararContraseña = async function(contraseñaCandidata: string): Promise<boolean> {
  return await comparePasswords(contraseñaCandidata, this.contraseña);
};

UsuarioSchema.methods.agregarFavorito = async function(anuncioId: mongoose.Types.ObjectId): Promise<void> {
  const favoriteExists = this.anunciosFavoritos.some((fav: AnuncioFavorito) => fav.anuncio.equals(anuncioId));
  if (!favoriteExists) {
    this.anunciosFavoritos.push({ anuncio: anuncioId });
    await this.save();
  }
};

UsuarioSchema.methods.eliminarFavorito = async function(anuncioId: mongoose.Types.ObjectId): Promise<void> {
  this.anunciosFavoritos = this.anunciosFavoritos.filter((fav: AnuncioFavorito) => !fav.anuncio.equals(anuncioId));
  await this.save();
};

UsuarioSchema.methods.listarFavoritos = function(): Array<AnuncioFavorito> {
  return this.anunciosFavoritos;
};

const Usuario = mongoose.model<IUsuario>('Usuario', UsuarioSchema);

export default Usuario;