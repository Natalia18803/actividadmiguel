import { body, param, validationResult } from 'express-validator';

// Middleware reutilizable para verificar errores
export const validarCampos = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: true, mensaje: 'Datos inválidos', errores: errors.array() });
  }
  next();
};

// Validaciones de Usuario
export const validacionCrearUsuario = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  body('rol')
    .optional()
    .isIn(['comprador', 'vendedor', 'admin'])
    .withMessage('Rol inválido')
];

export const validacionLogin = [
  body('email').trim().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
];

export const validacionCambioPassword = [
  body('password_actual').notEmpty().withMessage('La contraseña actual es obligatoria'),
  body('password_nueva')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número')
];

// Validaciones de Producto
export const validacionCrearProducto = [
  body('nombre').trim().isLength({ min: 2, max: 200 }).withMessage('El nombre debe tener entre 2 y 200 caracteres'),
  body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un número entero no negativo'),
  body('categoria_id').notEmpty().withMessage('La categoría es obligatoria').isMongoId().withMessage('ID de categoría inválido')
];

// Validaciones de Categoría
export const validacionCrearCategoria = [
  body('nombre').trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('descripcion').optional().trim().isLength({ max: 500 }).withMessage('La descripción no puede superar 500 caracteres')
];

// Validaciones de Orden
export const validacionCrearOrden = [
  body('productos').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
  body('productos.*.producto_id').notEmpty().isMongoId().withMessage('ID de producto inválido'),
  body('productos.*.cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
  body('productos.*.precio_unitario').isFloat({ min: 0 }).withMessage('El precio unitario debe ser positivo'),
  body('direccion_envio').optional().trim()
];

// Validar MongoID en params
export const validacionMongoId = [
  param('id').isMongoId().withMessage('ID inválido')
];
