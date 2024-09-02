import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  anuncio: mongoose.Types.ObjectId;
  participantes: mongoose.Types.ObjectId[];
  fechaCreacion: Date;
  mensajes: Array<{
    _id?: mongoose.Types.ObjectId; 
    emisor: mongoose.Types.ObjectId;
    contenido: string;
    fechaEnvio: Date;
    leido: boolean;
  }>;
}

const ChatSchema: Schema = new Schema({
  anuncio: { type: Schema.Types.ObjectId, ref: 'Anuncio', required: true },
  participantes: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
  fechaCreacion: { type: Date, default: Date.now },
  mensajes: [{
    _id: { type: Schema.Types.ObjectId, auto: true }, 
    emisor: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    contenido: { type: String, required: true },
    fechaEnvio: { type: Date, default: Date.now },
    leido: { type: Boolean, default: false }
    emisor: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    contenido: { type: String, required: true },
    fechaEnvio: { type: Date, default: Date.now }
  }]
});

export default mongoose.model<IChat>('Chat', ChatSchema);