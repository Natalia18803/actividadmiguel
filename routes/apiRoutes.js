import { Router } from 'express';
import { registrar } from '../controllers/authController.js';
import { crearProducto } from '../controllers/productController.js';
import { verificarToken } from '../middleware/auth.js';

const router = Router();

// Auth
router.post('/auth/register', registrar);

// Productos (Protegidos por Token)
router.post('/productos', verificarToken, crearProducto);

export default router;
