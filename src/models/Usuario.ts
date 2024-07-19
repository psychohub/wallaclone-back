import mongoose, { Document, Schema } from 'mongoose';

interface IUsuario extends Document {
  nombre: string;
  email: string;
  contraseña: string;
  fechaRegistro: Date;
  avatar: string;
  anunciosFavoritos: Array<{
    anuncio: mongoose.Schema.Types.ObjectId;
    fechaAgregado: Date;
  }>;
}

const UsuarioSchema: Schema = new Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  fechaRegistro: { type: Date, default: Date.now },
  avatar: String,
  anunciosFavoritos: [{
    anuncio: { type: Schema.Types.ObjectId, ref: 'Anuncio' },
    fechaAgregado: { type: Date, default: Date.now }
  }]
});

export default mongoose.model<IUsuario>('Usuario', UsuarioSchema);