import mongoose, { Document, Schema } from 'mongoose';

interface IMensaje extends Document {
  chat: mongoose.Schema.Types.ObjectId;
  emisor: mongoose.Schema.Types.ObjectId;
  contenido: string;
  fechaEnvio: Date;
  leido: boolean;
}

const MensajeSchema: Schema = new Schema({
  chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
  emisor: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  contenido: { type: String, required: true },
  fechaEnvio: { type: Date, default: Date.now },
  leido: { type: Boolean, default: false }
});

export default mongoose.model<IMensaje>('Mensaje', MensajeSchema);