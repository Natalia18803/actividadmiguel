import { verificarToken, extraerTokenDeHeader } from '../utils/jwt.js';
import Usuario from '../models/Usuario.js';

export const autenticar = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extraerTokenDeHeader(authHeader);
    const payload = verificarToken(token);

    const usuario = await Usuario.findById(payload.id);
    if (!usuario) {
      return res.status(401).json({ error: true, mensaje: 'Usuario no válido' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ error: true, mensaje: error.message });
  }
};

export const requiereRol = (rolesPermitidos) => {
  return (req, res, next) => {
    const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: true,
        mensaje: 'No tienes permisos para realizar esta acción',
        rolRequerido: roles,
        tuRol: req.usuario.rol
      });
    }
    next();
  };
};
