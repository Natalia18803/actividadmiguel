import mongoose from 'mongoose';

const detalleOrdenSchema = new mongoose.Schema({
  producto_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  cantidad: { type: Number, required: true, min: 1 },
  precio_unitario: { type: Number, required: true },
  subtotal: { type: Number, required: true }
});

const ordenSchema = new mongoose.Schema(
  {
    comprador_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El comprador es obligatorio']
    },
    total: {
      type: Number,
      required: [true, 'El total es obligatorio'],
      min: 0
    },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'],
      default: 'pendiente'
    },
    direccion_envio: { type: String, trim: true },
    notas: { type: String, trim: true },
    detalles: [detalleOrdenSchema]
  },
  {
    timestamps: { createdAt: 'fecha_orden', updatedAt: 'fecha_actualizacion' }
  }
);

const Orden = mongoose.model('Orden', ordenSchema);

export default Orden;
