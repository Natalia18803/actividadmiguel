import { Router } from 'express';
import ProductoController from '../controllers/productoController.js';
import { autenticar, requiereRol } from '../middlewares/auth.js';
import { validacionCrearProducto, validacionMongoId, validarCampos } from '../middlewares/validaciones.js';
import { subirImagenProducto } from '../config/multer.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos del marketplace
 */

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Listar productos con filtros (público)
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o descripción
 *       - in: query
 *         name: categoria_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID de categoría
 *       - in: query
 *         name: precio_min
 *         schema:
 *           type: number
 *       - in: query
 *         name: precio_max
 *         schema:
 *           type: number
 *       - in: query
 *         name: en_stock
 *         schema:
 *           type: string
 *           enum: [true, false]
 *       - in: query
 *         name: orden
 *         schema:
 *           type: string
 *           example: precio:asc
 *         description: "Formato: campo:asc|desc (ej: precio:asc, nombre:desc)"
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
 *         description: Lista de productos con paginación
 */
router.get('/', ProductoController.listar);

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener producto por ID (público)
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del producto
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', validacionMongoId, validarCampos, ProductoController.obtener);

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear producto (vendedor o admin)
 *     tags: [Productos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [nombre, precio, categoria_id]
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               stock:
 *                 type: integer
 *               categoria_id:
 *                 type: string
 *               imagen_producto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/',
  autenticar,
  requiereRol(['vendedor', 'admin']),
  subirImagenProducto,
  validacionCrearProducto,
  validarCampos,
  ProductoController.crear
);

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualizar producto (dueño o admin)
 *     tags: [Productos]
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
 *         description: Producto actualizado
 *       403:
 *         description: Sin permiso para modificar este producto
 */
router.put(
  '/:id',
  autenticar,
  requiereRol(['vendedor', 'admin']),
  subirImagenProducto,
  validacionMongoId,
  validarCampos,
  ProductoController.actualizar
);

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Eliminar producto (dueño o admin)
 *     tags: [Productos]
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
 *         description: Producto eliminado
 *       403:
 *         description: Sin permiso
 */
router.delete('/:id', autenticar, requiereRol(['vendedor', 'admin']), validacionMongoId, validarCampos, ProductoController.eliminar);

/**
 * @swagger
 * /api/productos/ia/descripcion:
 *   post:
 *     summary: Generar descripción de producto con IA (vendedor o admin)
 *     tags: [Productos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, categoria]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: iPhone 15 Pro
 *               categoria:
 *                 type: string
 *                 example: Electrónicos
 *               caracteristicas:
 *                 type: string
 *                 example: Pantalla OLED, cámara 48MP, chip A17 Pro
 *     responses:
 *       200:
 *         description: Descripción generada con sugerencias de categorías
 */
router.post('/ia/descripcion', autenticar, requiereRol(['vendedor', 'admin']), ProductoController.generarDescripcionIA);

export default router;
