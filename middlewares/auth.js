import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) return res.status(401).json({ msg: 'No hay token, acceso denegado' });

    try {
        const cifrado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = cifrado.usuario;
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token no válido' });
    }
};