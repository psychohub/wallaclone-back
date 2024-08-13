import mongoose, { Document, Schema } from 'mongoose';
import { comparePasswords, hashPassword } from '../utils/password';

export interface IUsuario extends Document {
  nombre: string;
  email: string;
  contraseña: string;
  fechaRegistro: Date;
  avatar?: string;
  anunciosFavoritos: Array<{
    anuncio: mongoose.Schema.Types.ObjectId;
    fechaAgregado: Date;
  }>;
  compararContraseña(contraseñaCandidata: string): Promise<boolean>;
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

// Método para hashear la contraseña antes de guardar
UsuarioSchema.pre<IUsuario>('save', async function(next) {
  if (!this.isModified('contraseña')) return next();
  this.contraseña = await hashPassword(this.contraseña);
  next();
});

// Método para comparar contraseñas
UsuarioSchema.methods.compararContraseña = async function(contraseñaCandidata: string): Promise<boolean> {
  return await comparePasswords(contraseñaCandidata, this.contraseña);
};

const Usuario = mongoose.model<IUsuario>('Usuario', UsuarioSchema);
export default Usuario;
