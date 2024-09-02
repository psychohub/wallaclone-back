import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  anuncio: mongoose.Types.ObjectId;
  participantes: mongoose.Types.ObjectId[];
  fechaCreacion: Date;
  mensajes: Array<{
    emisor: mongoose.Types.ObjectId;
    contenido: string;
    fechaEnvio: Date;
  }>;
}

const ChatSchema: Schema = new Schema({
  anuncio: { type: Schema.Types.ObjectId, ref: 'Anuncio', required: true },
  participantes: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
  fechaCreacion: { type: Date, default: Date.now },
  mensajes: [{
    emisor: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    contenido: { type: String, required: true },
    fechaEnvio: { type: Date, default: Date.now }
  }]
});

export default mongoose.model<IChat>('Chat', ChatSchema);