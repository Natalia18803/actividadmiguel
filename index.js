import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './src/config/database.js';
import { specs, swaggerUi, swaggerOptions } from './src/config/swagger.js';

import authRoutes from './src/routes/authRoutes.js';
import usuarioRoutes from './src/routes/usuarioRoutes.js';
import categoriaRoutes from './src/routes/categoriaRoutes.js';
import productoRoutes from './src/routes/productoRoutes.js';
import ordenRoutes from './src/routes/ordenRoutes.js';

// Conectar a MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares Globales 
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (imágenes subidas)
app.use('/uploads', express.static('uploads'));

// Rate Limiting global
const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { error: true, mensaje: 'Demasiadas peticiones. Intenta más tarde.' }
});
app.use('/api', limiter);

// Rate limiting estricto para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: true, mensaje: 'Demasiados intentos de autenticación. Espera 15 minutos.' }
});
app.use('/api/auth', authLimiter);

// Documentación Swagger 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// Rutas 
app.get('/', (req, res) => {
  res.json({
    mensaje: '🛒 Marketplace Inteligente API',
    version: '1.0.0',
    documentacion: `${process.env.BASE_URL || 'http://localhost:' + PORT}/api-docs`,
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      categorias: '/api/categorias',
      productos: '/api/productos',
      ordenes: '/api/ordenes'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ordenes', ordenRoutes);

// Manejo de Rutas No Encontradas 
app.use('*', (req, res) => {
  res.status(404).json({ error: true, mensaje: 'Endpoint no encontrado' });
});

//Manejador Global de Errores
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Error de Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: true, mensaje: 'El archivo supera el tamaño máximo permitido (5MB)' });
  }

  // Error de Multer: tipo de archivo
  if (err.message && err.message.includes('Tipo de archivo')) {
    return res.status(400).json({ error: true, mensaje: err.message });
  }

  res.status(err.status || 500).json({
    error: true,
    mensaje: err.message || 'Error interno del servidor'
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📚 Documentación: http://localhost:${PORT}/api-docs`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}\n`);
});
