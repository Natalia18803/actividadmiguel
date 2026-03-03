import { validationResult } from 'express-validator';
import fs from 'fs';
import Categoria from '../models/Categoria.js';
import Producto from '../models/Producto.js';
import gemini from '../config/gemini.js';

class CategoriaController {
  static async listar(req, res, next) {
    try {
      const { q, pagina = 1, limite = 10, orden = 'nombre:1' } = req.query;
      const filtros = {};

      if (q) filtros.nombre = { $regex: q, $options: 'i' };

      const limiteParsed = Math.min(parseInt(limite), 100);
      const skip = (parseInt(pagina) - 1) * limiteParsed;

      const sortObj = {};
      const [campo, dir] = orden.split(':');
      sortObj[campo] = parseInt(dir) || 1;

      const [categorias, total] = await Promise.all([
        Categoria.find(filtros).sort(sortObj).skip(skip).limit(limiteParsed),
        Categoria.countDocuments(filtros)
      ]);

      res.json({
        error: false,
        categorias,
        paginacion: { total, pagina: parseInt(pagina), limite: limiteParsed, paginas_totales: Math.ceil(total / limiteParsed) }
      });
    } catch (error) {
      next(error);
    }
  }

  static async obtener(req, res, next) {
    try {
      const categoria = await Categoria.findById(req.params.id);
      if (!categoria) {
        return res.status(404).json({ error: true, mensaje: 'Categoría no encontrada' });
      }
      res.json({ error: false, categoria });
    } catch (error) {
      next(error);
    }
  }

  static async crear(req, res, next) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ error: true, mensaje: 'Datos inválidos', errores: errores.array() });
      }

      const { nombre, descripcion } = req.body;

      const existente = await Categoria.findOne({ nombre: { $regex: `^${nombre}$`, $options: 'i' } });
      if (existente) {
        return res.status(409).json({ error: true, mensaje: 'Ya existe una categoría con ese nombre' });
      }

      const datosCategoria = { nombre, descripcion };
      if (req.file) {
        datosCategoria.imagen_icono = `/uploads/usuarios/${req.file.filename}`;
      }

      const categoria = await Categoria.create(datosCategoria);
      res.status(201).json({ error: false, mensaje: 'Categoría creada exitosamente', categoria });
    } catch (error) {
      next(error);
    }
  }

  static async actualizar(req, res, next) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ error: true, mensaje: 'Datos inválidos', errores: errores.array() });
      }

      const { nombre, descripcion } = req.body;
      const camposActualizar = {};
      if (nombre) camposActualizar.nombre = nombre;
      if (descripcion !== undefined) camposActualizar.descripcion = descripcion;
      if (req.file) camposActualizar.imagen_icono = `/uploads/usuarios/${req.file.filename}`;

      const categoria = await Categoria.findByIdAndUpdate(req.params.id, camposActualizar, { new: true, runValidators: true });
      if (!categoria) {
        return res.status(404).json({ error: true, mensaje: 'Categoría no encontrada' });
      }

      res.json({ error: false, mensaje: 'Categoría actualizada', categoria });
    } catch (error) {
      next(error);
    }
  }

  static async eliminar(req, res, next) {
    try {
      const categoria = await Categoria.findById(req.params.id);
      if (!categoria) {
        return res.status(404).json({ error: true, mensaje: 'Categoría no encontrada' });
      }

      // Verificar si hay productos asociados
      const productosAsociados = await Producto.countDocuments({ categoria_id: req.params.id });
      if (productosAsociados > 0) {
        return res.status(409).json({
          error: true,
          mensaje: `No se puede eliminar. La categoría tiene ${productosAsociados} producto(s) asociado(s)`
        });
      }

      // Eliminar imagen si existe
      if (categoria.imagen_icono) {
        const rutaImagen = `.${categoria.imagen_icono}`;
        if (fs.existsSync(rutaImagen)) fs.unlinkSync(rutaImagen);
      }

      await categoria.deleteOne();
      res.json({ error: false, mensaje: 'Categoría eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  static async obtenerProductos(req, res, next) {
    try {
      const { pagina = 1, limite = 10 } = req.query;
      const limiteParsed = Math.min(parseInt(limite), 50);
      const skip = (parseInt(pagina) - 1) * limiteParsed;

      const [productos, total] = await Promise.all([
        Producto.find({ categoria_id: req.params.id })
          .populate('vendedor_id', 'nombre email')
          .sort({ fecha_creacion: -1 })
          .skip(skip)
          .limit(limiteParsed),
        Producto.countDocuments({ categoria_id: req.params.id })
      ]);

      res.json({
        error: false,
        productos,
        paginacion: { total, pagina: parseInt(pagina), limite: limiteParsed, paginas_totales: Math.ceil(total / limiteParsed) }
      });
    } catch (error) {
      next(error);
    }
  }

  static async estadisticas(req, res, next) {
    try {
      const categoria = await Categoria.findById(req.params.id);
      if (!categoria) {
        return res.status(404).json({ error: true, mensaje: 'Categoría no encontrada' });
      }

      const stats = await Producto.aggregate([
        { $match: { categoria_id: categoria._id } },
        {
          $group: {
            _id: null,
            total_productos: { $sum: 1 },
            precio_promedio: { $avg: '$precio' },
            precio_min: { $min: '$precio' },
            precio_max: { $max: '$precio' },
            stock_total: { $sum: '$stock' }
          }
        }
      ]);

      res.json({
        error: false,
        categoria: categoria.nombre,
        estadisticas: stats[0] || {
          total_productos: 0, precio_promedio: 0, precio_min: 0, precio_max: 0, stock_total: 0
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async generarDescripcionIA(req, res, next) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ error: true, mensaje: 'Datos inválidos', errores: errores.array() });
      }

      const { nombre } = req.body;
      const descripcion = await gemini.generarDescripcionCategoria(nombre);
      const relacionadas = await gemini.sugerirCategoriasRelacionadas(nombre, descripcion);

      res.json({
        error: false,
        nombre,
        descripcion_generada: descripcion,
        categorias_relacionadas: relacionadas
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CategoriaController;
