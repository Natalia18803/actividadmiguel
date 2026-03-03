import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: 8
    },
    rol: {
      type: String,
      enum: ['comprador', 'vendedor', 'admin'],
      default: 'comprador'
    }
  },
  {
    timestamps: { createdAt: 'fecha_registro', updatedAt: 'fecha_actualizacion' }
  }
);

// No retornar password en queries
usuarioSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;
