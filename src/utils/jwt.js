import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

export const generarToken = (usuario) => {
  const payload = {
    id: usuario._id || usuario.id,
    email: usuario.email,
    rol: usuario.rol,
    iat: Math.floor(Date.now() / 1000)
  };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
    issuer: 'marketplace-api',
    audience: 'marketplace-users'
  });
};

export const verificarToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'marketplace-api',
      audience: 'marketplace-users'
    });
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

export const extraerTokenDeHeader = (authHeader) => {
  if (!authHeader) throw new Error('Token no proporcionado');
  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Formato de token inválido. Usar: Bearer <token>');
  }
  return authHeader.substring(7);
};
