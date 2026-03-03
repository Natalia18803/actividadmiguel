import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Marketplace Inteligente API',
      version: '1.0.0',
      description: 'API completa para marketplace con integración de IA (Gemini) y MongoDB',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'dev@marketplace.com'
      }
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          required: ['nombre', 'email', 'password'],
          properties: {
            _id: { type: 'string', description: 'ID MongoDB', example: '64abc123...' },
            nombre: { type: 'string', example: 'Juan Pérez' },
            email: { type: 'string', format: 'email', example: 'juan@ejemplo.com' },
            rol: { type: 'string', enum: ['comprador', 'vendedor', 'admin'], example: 'comprador' },
            fecha_registro: { type: 'string', format: 'date-time' }
          }
        },
        Producto: {
          type: 'object',
          required: ['nombre', 'precio', 'categoria_id'],
          properties: {
            _id: { type: 'string' },
            nombre: { type: 'string', example: 'iPhone 15 Pro' },
            descripcion: { type: 'string' },
            precio: { type: 'number', example: 999.99 },
            stock: { type: 'integer', example: 50 },
            imagen_url: { type: 'string' },
            categoria_id: { type: 'string', description: 'ID MongoDB de la categoría' },
            vendedor_id: { type: 'string', description: 'ID MongoDB del vendedor' }
          }
        },
        Categoria: {
          type: 'object',
          required: ['nombre'],
          properties: {
            _id: { type: 'string' },
            nombre: { type: 'string', example: 'Electrónicos' },
            descripcion: { type: 'string' },
            imagen_icono: { type: 'string' }
          }
        },
        Orden: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            comprador_id: { type: 'string' },
            total: { type: 'number' },
            estado: { type: 'string', enum: ['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'] },
            direccion_envio: { type: 'string' },
            fecha_orden: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'boolean', example: true },
            mensaje: { type: 'string', example: 'Mensaje de error descriptivo' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);
const swaggerOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Marketplace API Docs'
};

export { specs, swaggerUi, swaggerOptions };
