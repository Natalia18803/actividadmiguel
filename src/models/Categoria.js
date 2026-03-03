import mongoose from 'mongoose';

const categoriaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: 500
    },
    imagen_icono: {
      type: String,
      default: null
    }
  },
  {
    timestamps: { createdAt: 'fecha_creacion', updatedAt: 'fecha_actualizacion' }
  }
);

const Categoria = mongoose.model('Categoria', categoriaSchema);

export default Categoria;
