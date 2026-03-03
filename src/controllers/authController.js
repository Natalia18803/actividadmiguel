import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import Usuario from '../models/Usuario.js';
import { generarToken } from '../utils/jwt.js';

class AuthController {
  static async registro(req, res, next) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ error: true, mensaje: 'Datos de registro inválidos', errores: errores.array() });
      }

      const { nombre, email, password, rol } = req.body;

      const usuarioExistente = await Usuario.findOne({ email });
      if (usuarioExistente) {
        return res.status(409).json({ error: true, mensaje: 'El email ya está registrado' });
      }

      const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
      const nuevoUsuario = await Usuario.create({ nombre, email, password: passwordHash, rol: rol || 'comprador' });

      const token = generarToken(nuevoUsuario);

      res.status(201).json({
        error: false,
        mensaje: 'Usuario registrado exitosamente',
        usuario: nuevoUsuario,
        token
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ error: true, mensaje: 'Credenciales inválidas', errores: errores.array() });
      }

      const { email, password } = req.body;

      const usuario = await Usuario.findOne({ email }).select('+password');
      if (!usuario) {
        return res.status(401).json({ error: true, mensaje: 'Credenciales incorrectas' });
      }

      const passwordValida = await bcrypt.compare(password, usuario.password);
      if (!passwordValida) {
        return res.status(401).json({ error: true, mensaje: 'Credenciales incorrectas' });
      }

      const token = generarToken(usuario);

      res.json({
        error: false,
        mensaje: 'Inicio de sesión exitoso',
        usuario: usuario.toJSON(),
        token
      });
    } catch (error) {
      next(error);
    }
  }

  static async perfil(req, res, next) {
    try {
      const usuario = await Usuario.findById(req.usuario._id);
      if (!usuario) {
        return res.status(404).json({ error: true, mensaje: 'Usuario no encontrado' });
      }
      res.json({ error: false, usuario });
    } catch (error) {
      next(error);
    }
  }

  static async cambiarPassword(req, res, next) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ error: true, mensaje: 'Datos inválidos', errores: errores.array() });
      }

      const { password_actual, password_nueva } = req.body;

      const usuario = await Usuario.findById(req.usuario._id).select('+password');
      const passwordValida = await bcrypt.compare(password_actual, usuario.password);
      if (!passwordValida) {
        return res.status(401).json({ error: true, mensaje: 'La contraseña actual es incorrecta' });
      }

      usuario.password = await bcrypt.hash(password_nueva, parseInt(process.env.BCRYPT_ROUNDS) || 12);
      await usuario.save();

      res.json({ error: false, mensaje: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
