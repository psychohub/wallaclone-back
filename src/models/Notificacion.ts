import mongoose, { Document, Schema } from 'mongoose';

interface INotificacion extends Document {
  usuario: mongoose.Schema.Types.ObjectId;
  tipo: string;
  contenido: string;
  fechaCreacion: Date;
  leida: boolean;
}

const NotificacionSchema: Schema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  tipo: { type: String, required: true },
  contenido: { type: String, required: true },
  fechaCreacion: { type: Date, default: Date.now },
  leida: { type: Boolean, default: false }
});

export default mongoose.model<INotificacion>('Notificacion', NotificacionSchema);