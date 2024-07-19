import mongoose, { Document, Schema } from 'mongoose';

interface ITransaccion extends Document {
  anuncio: mongoose.Schema.Types.ObjectId;
  comprador: mongoose.Schema.Types.ObjectId;
  vendedor: mongoose.Schema.Types.ObjectId;
  monto: number;
  estado: 'pendiente' | 'completada' | 'cancelada';
  fechaTransaccion: Date;
}

const TransaccionSchema: Schema = new Schema({
  anuncio: { type: Schema.Types.ObjectId, ref: 'Anuncio', required: true },
  comprador: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  vendedor: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  monto: { type: Number, required: true },
  estado: { type: String, enum: ['pendiente', 'completada', 'cancelada'], default: 'pendiente' },
  fechaTransaccion: { type: Date, default: Date.now }
});

export default mongoose.model<ITransaccion>('Transaccion', TransaccionSchema);