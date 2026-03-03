import { Router } from 'express';
import CategoriaController from '../controllers/categoriaController.js';
import { autenticar, requiereRol } from '../middlewares/auth.js';
import { validacionCrearCategoria, validacionMongoId, validarCampos } from '../middlewares/validaciones.js';
import { subirIconoCategoria } from '../config/multer.js';
import { body } from 'express-validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categorías
 *   description: Gestión de categorías del marketplace
 */

/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Listar categorías (público)
 *     tags: [Categorías]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre
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
 *         description: Lista de categorías
 */
router.get('/', CategoriaController.listar);

/**
 * @swagger
 * /api/categorias/{id}:
 *   get:
 *     summary: Obtener categoría por ID (público)
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos de la categoría
 *       404:
 *         description: Categoría no encontrada
 */
router.get('/:id', validacionMongoId, validarCampos, CategoriaController.obtener);

/**
 * @swagger
 * /api/categorias/{id}/productos:
 *   get:
 *     summary: Obtener productos de una categoría (público)
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Productos de la categoría con paginación
 */
router.get('/:id/productos', validacionMongoId, validarCampos, CategoriaController.obtenerProductos);

/**
 * @swagger
 * /api/categorias/{id}/estadisticas:
 *   get:
 *     summary: Estadísticas de productos de una categoría (solo admin)
 *     tags: [Categorías]
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
 *         description: Estadísticas agregadas de la categoría
 */
router.get('/:id/estadisticas', autenticar, requiereRol('admin'), validacionMongoId, validarCampos, CategoriaController.estadisticas);

/**
 * @swagger
 * /api/categorias:
 *   post:
 *     summary: Crear categoría (solo admin)
 *     tags: [Categorías]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               imagen_icono:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *       409:
 *         description: Nombre de categoría ya existe
 */
router.post('/', autenticar, requiereRol('admin'), subirIconoCategoria, validacionCrearCategoria, validarCampos, CategoriaController.crear);

/**
 * @swagger
 * /api/categorias/{id}:
 *   put:
 *     summary: Actualizar categoría (solo admin)
 *     tags: [Categorías]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               imagen_icono:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Categoría actualizada
 */
router.put('/:id', autenticar, requiereRol('admin'), subirIconoCategoria, validacionMongoId, validarCampos, CategoriaController.actualizar);

/**
 * @swagger
 * /api/categorias/{id}:
 *   delete:
 *     summary: Eliminar categoría (solo admin)
 *     tags: [Categorías]
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
 *         description: Categoría eliminada
 *       409:
 *         description: No se puede eliminar, tiene productos asociados
 */
router.delete('/:id', autenticar, requiereRol('admin'), validacionMongoId, validarCampos, CategoriaController.eliminar);

/**
 * @swagger
 * /api/categorias/ia/generar:
 *   post:
 *     summary: Generar descripción de categoría con IA (solo admin)
 *     tags: [Categorías]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Electrónicos
 *     responses:
 *       200:
 *         description: Descripción generada por IA con categorías relacionadas
 */
router.post(
  '/ia/generar',
  autenticar,
  requiereRol('admin'),
  [body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio')],
  validarCampos,
  CategoriaController.generarDescripcionIA
);

export default router;
