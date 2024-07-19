import mongoose, { Document, Schema } from 'mongoose';

interface IChat extends Document {
  anuncio: mongoose.Schema.Types.ObjectId;
  participantes: mongoose.Schema.Types.ObjectId[];
  fechaCreacion: Date;
}

const ChatSchema: Schema = new Schema({
  anuncio: { type: Schema.Types.ObjectId, ref: 'Anuncio', required: true },
  participantes: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
  fechaCreacion: { type: Date, default: Date.now }
});

export default mongoose.model<IChat>('Chat', ChatSchema);