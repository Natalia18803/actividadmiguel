import { Router } from 'express';
import AuthController from '../controllers/authController.js';
import { autenticar } from '../middlewares/auth.js';
import { validacionCrearUsuario, validacionLogin, validacionCambioPassword, validarCampos } from '../middlewares/validaciones.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Registro, login y gestión de sesión
 */

/**
 * @swagger
 * /api/auth/registro:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, password]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@ejemplo.com
 *               password:
 *                 type: string
 *                 example: MiPassword123
 *               rol:
 *                 type: string
 *                 enum: [comprador, vendedor]
 *                 default: comprador
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Email ya registrado
 */
router.post('/registro', validacionCrearUsuario, validarCampos, AuthController.registro);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@ejemplo.com
 *               password:
 *                 type: string
 *                 example: MiPassword123
 *     responses:
 *       200:
 *         description: Login exitoso, retorna token JWT
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', validacionLogin, validarCampos, AuthController.login);

/**
 * @swagger
 * /api/auth/perfil:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: Token inválido o no proporcionado
 */
router.get('/perfil', autenticar, AuthController.perfil);

/**
 * @swagger
 * /api/auth/cambiar-password:
 *   put:
 *     summary: Cambiar contraseña del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password_actual, password_nueva]
 *             properties:
 *               password_actual:
 *                 type: string
 *               password_nueva:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       401:
 *         description: Contraseña actual incorrecta
 */
router.put('/cambiar-password', autenticar, validacionCambioPassword, validarCampos, AuthController.cambiarPassword);

export default router;
