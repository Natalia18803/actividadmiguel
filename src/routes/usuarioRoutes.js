import { Router } from 'express';
import UsuarioController from '../controllers/usuarioController.js';
import { autenticar, requiereRol } from '../middlewares/auth.js';
import { validacionMongoId, validarCampos } from '../middlewares/validaciones.js';
import { body } from 'express-validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios (solo admin)
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar usuarios (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: rol
 *         schema:
 *           type: string
 *           enum: [comprador, vendedor, admin]
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o email
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de usuarios con paginación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos de administrador
 */
router.get('/', autenticar, requiereRol('admin'), UsuarioController.listar);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', autenticar, requiereRol('admin'), validacionMongoId, validarCampos, UsuarioController.obtener);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [comprador, vendedor, admin]
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put(
  '/:id',
  autenticar,
  requiereRol('admin'),
  validacionMongoId,
  [
    body('nombre').optional().trim().isLength({ min: 2, max: 100 }),
    body('rol').optional().isIn(['comprador', 'vendedor', 'admin'])
  ],
  validarCampos,
  UsuarioController.actualizar
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', autenticar, requiereRol('admin'), validacionMongoId, validarCampos, UsuarioController.eliminar);

export default router;
