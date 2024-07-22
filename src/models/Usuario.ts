import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

interface IUsuario extends Document {
  nombre: string;
  email: string;
  contraseña: string;
  fechaRegistro: Date;
  avatar?: string;
  anunciosFavoritos: Array<{
    anuncio: mongoose.Schema.Types.ObjectId;
    fechaAgregado: Date;
  }>;
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
  
  const salt = await bcrypt.genSalt(10);
  this.contraseña = await bcrypt.hash(this.contraseña, salt);
  next();
});

export default mongoose.model<IUsuario>('Usuario', UsuarioSchema);