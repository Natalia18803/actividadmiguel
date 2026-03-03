import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import Usuario from '../models/Usuario.js';

class UsuarioController {
  static async listar(req, res, next) {
    try {
      const { rol, q, pagina = 1, limite = 10, orden = 'fecha_registro:-1' } = req.query;
      const filtros = {};

      if (rol) filtros.rol = rol;
      if (q) filtros.$or = [
        { nombre: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];

      const limiteParsed = Math.min(parseInt(limite), 100);
      const skip = (parseInt(pagina) - 1) * limiteParsed;

      const sortObj = {};
      const [campoOrden, dirOrden] = orden.split(':');
      sortObj[campoOrden] = parseInt(dirOrden) || -1;

      const [usuarios, total] = await Promise.all([
        Usuario.find(filtros).sort(sortObj).skip(skip).limit(limiteParsed),
        Usuario.countDocuments(filtros)
      ]);

      res.json({
        error: false,
        usuarios,
        paginacion: {
          total,
          pagina: parseInt(pagina),
          limite: limiteParsed,
          paginas_totales: Math.ceil(total / limiteParsed)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async obtener(req, res, next) {
    try {
      const usuario = await Usuario.findById(req.params.id);
      if (!usuario) {
        return res.status(404).json({ error: true, mensaje: 'Usuario no encontrado' });
      }
      res.json({ error: false, usuario });
    } catch (error) {
      next(error);
    }
  }

  static async actualizar(req, res, next) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ error: true, mensaje: 'Datos inválidos', errores: errores.array() });
      }

      // Solo se permite actualizar estos campos
      const { nombre, rol } = req.body;
      const camposActualizar = {};
      if (nombre) camposActualizar.nombre = nombre;
      if (rol) camposActualizar.rol = rol;

      const usuario = await Usuario.findByIdAndUpdate(req.params.id, camposActualizar, { new: true, runValidators: true });
      if (!usuario) {
        return res.status(404).json({ error: true, mensaje: 'Usuario no encontrado' });
      }

      res.json({ error: false, mensaje: 'Usuario actualizado', usuario });
    } catch (error) {
      next(error);
    }
  }

  static async eliminar(req, res, next) {
    try {
      const usuario = await Usuario.findByIdAndDelete(req.params.id);
      if (!usuario) {
        return res.status(404).json({ error: true, mensaje: 'Usuario no encontrado' });
      }
      res.json({ error: false, mensaje: 'Usuario eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}

export default UsuarioController;
