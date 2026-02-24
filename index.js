import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { conectarDB } from './config/db.js';
import apiRoutes from '../routes/apiRoutes.js';

dotenv.config();
const app = express();

// Conexión a MongoDB
conectarDB();

// Middlewares (Módulo 2)
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rutas (Módulo 3)
app.use('/api', apiRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ msg: 'Algo salió mal en el servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});


