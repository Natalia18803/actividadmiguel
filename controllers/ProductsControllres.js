import Product from '../models/Product.js';
import axios from 'axios';

export const crearProducto = async (req, res) => {
    const { nombre, precio, categoria } = req.body;
    try {
        // Módulo 6: IA de Gemini
        const aiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: `Crea una descripción corta para un producto llamado: ${nombre}` }] }]
            }
        );

        const descripcionIA = aiResponse.data.candidates[0].content.parts[0].text;

        const nuevoProducto = new Product({
            nombre,
            descripcion: descripcionIA,
            precio,
            categoria,
            vendedor: req.usuario.id
        });

        await nuevoProducto.save();
        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(500).json({ msg: 'Error al crear producto' });
    }
};
