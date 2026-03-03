import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Orden from '../models/Orden.js';
import Producto from '../models/Producto.js';
import gemini from '../config/gemini.js';

class OrdenController {
  static async crear(req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        await session.abortTransaction();
        return res.status(400).json({ error: true, mensaje: 'Datos inválidos', errores: errores.array() });
      }

      const { productos: productosReq, direccion_envio, notas } = req.body;
      const detalles = [];
      let total = 0;

      for (const item of productosReq) {
        const producto = await Producto.findById(item.producto_id).session(session);

        if (!producto) {
          await session.abortTransaction();
          return res.status(404).json({ error: true, mensaje: `Producto ${item.producto_id} no encontrado` });
        }

        if (producto.stock < item.cantidad) {
          await session.abortTransaction();
          return res.status(409).json({
            error: true,
            mensaje: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}, Solicitado: ${item.cantidad}`
          });
        }

        // Verificar variación de precio (máx 5%)
        const diferenciaPrecio = Math.abs(producto.precio - item.precio_unitario) / producto.precio;
        if (diferenciaPrecio > 0.05) {
          await session.abortTransaction();
          return res.status(409).json({
            error: true,
            mensaje: `El precio del producto "${producto.nombre}" ha cambiado. Actualiza tu carrito.`
          });
        }

        // Reducir stock
        await Producto.findByIdAndUpdate(item.producto_id, { $inc: { stock: -item.cantidad } }, { session });

        const subtotal = item.cantidad * item.precio_unitario;
        total += subtotal;
        detalles.push({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal
        });
      }

      const [orden] = await Orden.create(
        [{ comprador_id: req.usuario._id, total, estado: 'pendiente', direccion_envio, notas, detalles }],
        { session }
      );

      await session.commitTransaction();
      await orden.populate('comprador_id', 'nombre email');
      await orden.populate('detalles.producto_id', 'nombre imagen_url');

      res.status(201).json({ error: false, mensaje: 'Orden creada exitosamente', orden });
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  }

  static async listar(req, res, next) {
    try {
      const { estado, pagina = 1, limite = 10 } = req.query;
      const filtros = {};

      // Compradores solo ven sus órdenes; admins ven todas
      if (req.usuario.rol !== 'admin') {
        filtros.comprador_id = req.usuario._id;
      }
      if (estado) filtros.estado = estado;

      const limiteParsed = Math.min(parseInt(limite), 50);
      const skip = (parseInt(pagina) - 1) * limiteParsed;

      const [ordenes, total] = await Promise.all([
        Orden.find(filtros)
          .populate('comprador_id', 'nombre email')
          .populate('detalles.producto_id', 'nombre imagen_url')
          .sort({ fecha_orden: -1 })
          .skip(skip)
          .limit(limiteParsed),
        Orden.countDocuments(filtros)
      ]);

      res.json({
        error: false,
        ordenes,
        paginacion: { total, pagina: parseInt(pagina), limite: limiteParsed, paginas_totales: Math.ceil(total / limiteParsed) }
      });
    } catch (error) {
      next(error);
    }
  }

  static async obtener(req, res, next) {
    try {
      const orden = await Orden.findById(req.params.id)
        .populate('comprador_id', 'nombre email')
        .populate('detalles.producto_id', 'nombre imagen_url precio');

      if (!orden) {
        return res.status(404).json({ error: true, mensaje: 'Orden no encontrada' });
      }

      // Solo el comprador o admin puede ver la orden
      if (orden.comprador_id._id.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: true, mensaje: 'No tienes acceso a esta orden' });
      }

      res.json({ error: false, orden });
    } catch (error) {
      next(error);
    }
  }

  static async actualizarEstado(req, res, next) {
    try {
      const { estado, notas } = req.body;
      const estadosValidos = ['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'];

      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: true, mensaje: 'Estado inválido' });
      }

      const camposActualizar = { estado };
      if (notas) camposActualizar.notas = notas;

      const orden = await Orden.findByIdAndUpdate(req.params.id, camposActualizar, { new: true })
        .populate('comprador_id', 'nombre email');

      if (!orden) {
        return res.status(404).json({ error: true, mensaje: 'Orden no encontrada' });
      }

      res.json({ error: false, mensaje: 'Estado actualizado', orden });
    } catch (error) {
      next(error);
    }
  }

  static async analizarPatrones(req, res, next) {
    try {
      const ordenes = await Orden.find({ comprador_id: req.usuario._id })
        .populate('detalles.producto_id', 'nombre')
        .sort({ fecha_orden: -1 })
        .limit(50);

      if (ordenes.length === 0) {
        return res.json({ error: false, mensaje: 'No hay órdenes suficientes para analizar', analisis: null });
      }

      const analisis = await gemini.analizarPatronCompras(ordenes);
      res.json({ error: false, analisis });
    } catch (error) {
      next(error);
    }
  }
}

export default OrdenController;
