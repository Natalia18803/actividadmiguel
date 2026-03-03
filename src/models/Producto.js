import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema(
  {
    vendedor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El vendedor es obligatorio']
    },
    categoria_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria',
      required: [true, 'La categoría es obligatoria']
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: 2,
      maxlength: 200
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo']
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'El stock no puede ser negativo']
    },
    imagen_url: {
      type: String,
      default: null
    }
  },
  {
    timestamps: { createdAt: 'fecha_creacion', updatedAt: 'fecha_actualizacion' }
  }
);

const Producto = mongoose.model('Producto', productoSchema);

export default Producto;
