import { validationResult } from 'express-validator';
import fs from 'fs';
import Producto from '../models/Producto.js';
import Categoria from '../models/Categoria.js';
import gemini from '../config/gemini.js';
import { construirFiltrosProducto, parsearOrdenamiento } from '../utils/filtros.js';

class ProductoController {
  static async listar(req, res, next) {
    try {
      const filtros = construirFiltrosProducto(req.query);
      const sortObj = parsearOrdenamiento(req.query.orden) || { fecha_creacion: -1 };
      const limite = Math.min(parseInt(req.query.limite) || 10, 50);
      const skip = (parseInt(req.query.pagina || 1) - 1) * limite;

      const [productos, total] = await Promise.all([
        Producto.find(filtros)
          .populate('vendedor_id', 'nombre email')
          .populate('categoria_id', 'nombre')
          .sort(sortObj)
          .skip(skip)
          .limit(limite),
        Producto.countDocuments(filtros)
      ]);

      res.json({
        error: false,
        productos,
        paginacion: {
          total,
          pagina: parseInt(req.query.pagina || 1),
          limite,
          paginas_totales: Math.ceil(total / limite)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async obtener(req, res, next) {
    try {
      const producto = await Producto.findById(req.params.id)
        .populate('vendedor_id', 'nombre email')
        .populate('categoria_id', 'nombre descripcion');

      if (!producto) {
        return res.status(404).json({ error: true, mensaje: 'Producto no encontrado' });
      }
      res.json({ error: false, producto });
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

      const { nombre, descripcion, precio, stock, categoria_id } = req.body;

      // Verificar que la categoría existe
      const categoria = await Categoria.findById(categoria_id);
      if (!categoria) {
        return res.status(404).json({ error: true, mensaje: 'Categoría no encontrada' });
      }

      const datosProducto = {
        vendedor_id: req.usuario._id,
        categoria_id,
        nombre,
        descripcion,
        precio,
        stock: stock || 0
      };

      if (req.file) {
        datosProducto.imagen_url = `/uploads/productos/${req.file.filename}`;
      }

      const producto = await Producto.create(datosProducto);
      await producto.populate('categoria_id', 'nombre');

      res.status(201).json({ error: false, mensaje: 'Producto creado exitosamente', producto });
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

      const producto = await Producto.findById(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: true, mensaje: 'Producto no encontrado' });
      }

      // Solo el vendedor dueño o admin puede actualizar
      if (producto.vendedor_id.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: true, mensaje: 'No tienes permiso para modificar este producto' });
      }

      const camposPermitidos = ['nombre', 'descripcion', 'precio', 'stock', 'categoria_id'];
      camposPermitidos.forEach(campo => {
        if (req.body[campo] !== undefined) producto[campo] = req.body[campo];
      });

      if (req.file) producto.imagen_url = `/uploads/productos/${req.file.filename}`;

      await producto.save();
      res.json({ error: false, mensaje: 'Producto actualizado', producto });
    } catch (error) {
      next(error);
    }
  }

  static async eliminar(req, res, next) {
    try {
      const producto = await Producto.findById(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: true, mensaje: 'Producto no encontrado' });
      }

      if (producto.vendedor_id.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: true, mensaje: 'No tienes permiso para eliminar este producto' });
      }

      if (producto.imagen_url) {
        const rutaImagen = `.${producto.imagen_url}`;
        if (fs.existsSync(rutaImagen)) fs.unlinkSync(rutaImagen);
      }

      await producto.deleteOne();
      res.json({ error: false, mensaje: 'Producto eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  static async generarDescripcionIA(req, res, next) {
    try {
      const { nombre, categoria, caracteristicas } = req.body;
      if (!nombre || !categoria) {
        return res.status(400).json({ error: true, mensaje: 'Se requieren nombre y categoría' });
      }

      const descripcion = await gemini.generarDescripcionProducto(nombre, categoria, caracteristicas || '');
      const categoriasSubgeridas = await gemini.sugerirCategorias(nombre, descripcion);

      res.json({
        error: false,
        descripcion_generada: descripcion,
        categorias_sugeridas: categoriasSubgeridas
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ProductoController;
