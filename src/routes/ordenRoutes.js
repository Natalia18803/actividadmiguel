import { Router } from 'express';
import OrdenController from '../controllers/ordenController.js';
import { autenticar, requiereRol } from '../middlewares/auth.js';
import { validacionCrearOrden, validacionMongoId, validarCampos } from '../middlewares/validaciones.js';
import { body } from 'express-validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Órdenes
 *   description: Gestión de órdenes de compra
 */

/**
 * @swagger
 * /api/ordenes:
 *   post:
 *     summary: Crear nueva orden (comprador)
 *     tags: [Órdenes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productos]
 *             properties:
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [producto_id, cantidad, precio_unitario]
 *                   properties:
 *                     producto_id:
 *                       type: string
 *                     cantidad:
 *                       type: integer
 *                       minimum: 1
 *                     precio_unitario:
 *                       type: number
 *               direccion_envio:
 *                 type: string
 *               notas:
 *                 type: string
 *     responses:
 *       201:
 *         description: Orden creada exitosamente (con transacción atómica)
 *       409:
 *         description: Stock insuficiente o precio desactualizado
 */
router.post('/', autenticar, requiereRol(['comprador', 'admin']), validacionCrearOrden, validarCampos, OrdenController.crear);

/**
 * @swagger
 * /api/ordenes:
 *   get:
 *     summary: Listar órdenes (propias para compradores, todas para admin)
 *     tags: [Órdenes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, confirmada, enviada, entregada, cancelada]
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
 *         description: Lista de órdenes con paginación
 */
router.get('/', autenticar, OrdenController.listar);

/**
 * @swagger
 * /api/ordenes/mis-patrones:
 *   get:
 *     summary: Análisis de patrones de compra con IA
 *     tags: [Órdenes]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Análisis IA de patrones de compra del usuario
 */
router.get('/mis-patrones', autenticar, OrdenController.analizarPatrones);

/**
 * @swagger
 * /api/ordenes/{id}:
 *   get:
 *     summary: Obtener orden por ID (dueño o admin)
 *     tags: [Órdenes]
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
 *         description: Detalle de la orden
 *       403:
 *         description: Sin acceso a esta orden
 *       404:
 *         description: Orden no encontrada
 */
router.get('/:id', autenticar, validacionMongoId, validarCampos, OrdenController.obtener);

/**
 * @swagger
 * /api/ordenes/{id}/estado:
 *   put:
 *     summary: Actualizar estado de una orden (solo admin)
 *     tags: [Órdenes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, confirmada, enviada, entregada, cancelada]
 *               notas:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.put(
  '/:id/estado',
  autenticar,
  requiereRol('admin'),
  validacionMongoId,
  [body('estado').notEmpty().isIn(['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'])],
  validarCampos,
  OrdenController.actualizarEstado
);

export default router;
