import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registrar = async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Email ya registrado' });

        user = new User({ nombre, email, password, rol });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        await user.save();
        
        const payload = { usuario: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '4h' });
        
        res.json({ token, msg: 'Usuario creado con éxito' });
    } catch (error) {
        res.status(500).send('Error en el servidor');
    }
};