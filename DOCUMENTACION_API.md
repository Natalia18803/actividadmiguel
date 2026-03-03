# 📚 Marketplace Inteligente API — Documentación de Uso

**Base URL:** `http://localhost:3000`  
**Documentación interactiva (Swagger):** `http://localhost:3000/api-docs`

---

## 🚀 Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Copia `.env.template` a `.env` y completa los valores:
```env
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

MONGO_URI=mongodb://localhost:27017/marketplace

JWT_SECRET=tu_secreto_muy_seguro_con_al_menos_32_caracteres
JWT_EXPIRE=7d

GEMINI_API_KEY=tu_api_key_de_gemini_aqui

BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### 3. Iniciar el servidor
```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

---

## 🔐 Autenticación

Todos los endpoints protegidos requieren el header:
```
Authorization: Bearer <token_jwt>
```

El token se obtiene al hacer login o registro.

---

## 📋 Endpoints

### 🔑 Auth — `/api/auth`

#### `POST /api/auth/registro`
Registra un nuevo usuario.

**Body (JSON):**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "MiPassword123",
  "rol": "comprador"
}
```
> `rol` puede ser: `comprador`, `vendedor`, `admin`  
> `rol` es opcional, por defecto es `comprador`

**Respuesta exitosa (201):**
```json
{
  "error": false,
  "mensaje": "Usuario registrado exitosamente",
  "usuario": { "_id": "...", "nombre": "Juan Pérez", "email": "juan@ejemplo.com", "rol": "comprador" },
  "token": "eyJhbGci..."
}
```

---

#### `POST /api/auth/login`
Inicia sesión y retorna token JWT.

**Body (JSON):**
```json
{
  "email": "juan@ejemplo.com",
  "password": "MiPassword123"
}
```

**Respuesta exitosa (200):**
```json
{
  "error": false,
  "mensaje": "Inicio de sesión exitoso",
  "usuario": { "_id": "...", "nombre": "Juan Pérez", "rol": "comprador" },
  "token": "eyJhbGci..."
}
```

---

#### `GET /api/auth/perfil` 🔒
Obtiene el perfil del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

---

#### `PUT /api/auth/cambiar-password` 🔒
Cambia la contraseña del usuario autenticado.

**Body (JSON):**
```json
{
  "password_actual": "MiPassword123",
  "password_nueva": "NuevaPassword456"
}
```

---

### 👥 Usuarios — `/api/usuarios` 🔒 (solo admin)

#### `GET /api/usuarios`
Lista todos los usuarios con filtros y paginación.

**Query params:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `rol` | string | Filtrar por rol (`comprador`, `vendedor`, `admin`) |
| `q` | string | Búsqueda por nombre o email |
| `pagina` | integer | Número de página (default: 1) |
| `limite` | integer | Resultados por página (default: 10, max: 100) |
| `orden` | string | Ej: `nombre:1` o `fecha_registro:-1` |

**Ejemplo:** `GET /api/usuarios?rol=vendedor&pagina=1&limite=5`

---

#### `GET /api/usuarios/:id`
Obtiene un usuario por su ID de MongoDB.

---

#### `PUT /api/usuarios/:id`
Actualiza nombre y/o rol de un usuario.

**Body (JSON):**
```json
{
  "nombre": "Juan Actualizado",
  "rol": "vendedor"
}
```

---

#### `DELETE /api/usuarios/:id`
Elimina un usuario.

---

### 🗂️ Categorías — `/api/categorias`

#### `GET /api/categorias` 🌐 (público)
Lista categorías con búsqueda y paginación.

**Query params:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `q` | string | Búsqueda por nombre |
| `pagina` | integer | Número de página |
| `limite` | integer | Resultados por página |
| `orden` | string | Ej: `nombre:1` |

---

#### `GET /api/categorias/:id` 🌐 (público)
Obtiene una categoría por ID.

---

#### `GET /api/categorias/:id/productos` 🌐 (público)
Lista todos los productos de una categoría con paginación.

---

#### `GET /api/categorias/:id/estadisticas` 🔒 (admin)
Estadísticas de productos de la categoría: total, precio promedio, mínimo, máximo, stock total.

---

#### `POST /api/categorias` 🔒 (admin)
Crea una nueva categoría. Soporta subida de imagen (multipart/form-data).

**Form-data:**
| Campo | Tipo | Requerido |
|-------|------|-----------|
| `nombre` | string | ✅ |
| `descripcion` | string | ❌ |
| `imagen_icono` | file (JPG/PNG/WEBP) | ❌ |

---

#### `PUT /api/categorias/:id` 🔒 (admin)
Actualiza una categoría. Acepta multipart/form-data para actualizar imagen.

---

#### `DELETE /api/categorias/:id` 🔒 (admin)
Elimina una categoría. **No se puede eliminar si tiene productos asociados.**

---

#### `POST /api/categorias/ia/generar` 🔒 (admin)
Genera descripción automática para una categoría usando Gemini AI.

**Body (JSON):**
```json
{
  "nombre": "Electrónicos"
}
```

**Respuesta (200):**
```json
{
  "error": false,
  "nombre": "Electrónicos",
  "descripcion_generada": "Encuentra los últimos dispositivos tecnológicos...",
  "categorias_relacionadas": ["Computadores", "Accesorios Tech", "Audio y Video"]
}
```

---

### 📦 Productos — `/api/productos`

#### `GET /api/productos` 🌐 (público)
Lista productos con múltiples filtros.

**Query params:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `q` | string | Búsqueda en nombre y descripción |
| `categoria_id` | string | ID MongoDB de la categoría |
| `vendedor_id` | string | ID MongoDB del vendedor |
| `precio_min` | number | Precio mínimo |
| `precio_max` | number | Precio máximo |
| `en_stock` | string | `true` para solo productos con stock |
| `orden` | string | Ej: `precio:asc`, `nombre:desc`, `fecha_creacion:desc` |
| `pagina` | integer | Número de página (default: 1) |
| `limite` | integer | Resultados por página (default: 10, max: 50) |

**Ejemplo:** `GET /api/productos?q=iphone&precio_min=500&en_stock=true&orden=precio:asc`

---

#### `GET /api/productos/:id` 🌐 (público)
Obtiene un producto con datos del vendedor y categoría (populate).

---

#### `POST /api/productos` 🔒 (vendedor, admin)
Crea un nuevo producto. Acepta multipart/form-data para imagen.

**Form-data:**
| Campo | Tipo | Requerido |
|-------|------|-----------|
| `nombre` | string | ✅ |
| `precio` | number | ✅ |
| `categoria_id` | string (MongoID) | ✅ |
| `descripcion` | string | ❌ |
| `stock` | integer | ❌ (default: 0) |
| `imagen_producto` | file (JPG/PNG/WEBP, max 5MB) | ❌ |

---

#### `PUT /api/productos/:id` 🔒 (dueño del producto o admin)
Actualiza un producto. Solo el vendedor que lo creó o un admin puede modificarlo.

---

#### `DELETE /api/productos/:id` 🔒 (dueño del producto o admin)
Elimina un producto. También elimina su imagen del servidor.

---

#### `POST /api/productos/ia/descripcion` 🔒 (vendedor, admin)
Genera una descripción automática para un producto usando Gemini AI.

**Body (JSON):**
```json
{
  "nombre": "iPhone 15 Pro",
  "categoria": "Electrónicos",
  "caracteristicas": "Pantalla OLED 6.1\", chip A17 Pro, cámara 48MP, titanio"
}
```

**Respuesta (200):**
```json
{
  "error": false,
  "descripcion_generada": "Experimenta el futuro en la palma de tu mano...",
  "categorias_sugeridas": ["Electrónicos", "Smartphones", "Tecnología"]
}
```

---

### 🛒 Órdenes — `/api/ordenes` 🔒

#### `POST /api/ordenes` 🔒 (comprador, admin)
Crea una orden de compra. Usa **transacción atómica** MongoDB: valida stock, verifica precios y descuenta stock en una sola operación.

**Body (JSON):**
```json
{
  "productos": [
    {
      "producto_id": "64abc123...",
      "cantidad": 2,
      "precio_unitario": 999.99
    }
  ],
  "direccion_envio": "Calle 123, Bucaramanga",
  "notas": "Entregar en horario de oficina"
}
```

> ⚠️ Si el `precio_unitario` difiere más del 5% del precio actual en BD, la orden es rechazada.

**Respuesta exitosa (201):**
```json
{
  "error": false,
  "mensaje": "Orden creada exitosamente",
  "orden": {
    "_id": "...",
    "total": 1999.98,
    "estado": "pendiente",
    "detalles": [...]
  }
}
```

---

#### `GET /api/ordenes` 🔒
- **Comprador:** Lista solo sus propias órdenes
- **Admin:** Lista todas las órdenes

**Query params:** `estado`, `pagina`, `limite`

---

#### `GET /api/ordenes/mis-patrones` 🔒
Análisis de patrones de compra del usuario autenticado usando Gemini AI.

**Respuesta (200):**
```json
{
  "error": false,
  "analisis": {
    "frecuencia": "Compras cada 2-3 semanas",
    "promedio_gasto": 250.50,
    "tendencias": "Mayor actividad los fines de semana",
    "recomendaciones": ["Considera suscribirte para descuentos", "Explora categoría Electrónicos"]
  }
}
```

---

#### `GET /api/ordenes/:id` 🔒
Obtiene detalle de una orden. Solo el comprador dueño o un admin pueden acceder.

---

#### `PUT /api/ordenes/:id/estado` 🔒 (solo admin)
Actualiza el estado de una orden.

**Body (JSON):**
```json
{
  "estado": "confirmada",
  "notas": "Pago verificado, preparando envío"
}
```
> Estados válidos: `pendiente` → `confirmada` → `enviada` → `entregada` / `cancelada`

---

## 🔄 Flujo de una Petición (Arquitectura)

```
Cliente → CORS → Helmet → Rate Limit → Morgan → Validaciones → JWT → Controlador → Modelo (MongoDB) → Respuesta
```

## ⚠️ Códigos de Respuesta HTTP

| Código | Significado | Ejemplo |
|--------|-------------|---------|
| `200` | OK | Consulta exitosa |
| `201` | Created | Recurso creado |
| `400` | Bad Request | Validación fallida |
| `401` | Unauthorized | Token ausente o inválido |
| `403` | Forbidden | Token válido, sin permisos |
| `404` | Not Found | Recurso no encontrado |
| `409` | Conflict | Email duplicado, stock insuficiente |
| `429` | Too Many Requests | Rate limit excedido |
| `500` | Internal Server Error | Error inesperado del servidor |

---

## 🤖 Integración con Gemini AI

Los siguientes endpoints usan la API de Gemini (requieren `GEMINI_API_KEY`):

| Endpoint | Función |
|----------|---------|
| `POST /api/productos/ia/descripcion` | Genera descripción persuasiva para productos |
| `POST /api/categorias/ia/generar` | Genera descripción y sugiere categorías relacionadas |
| `GET /api/ordenes/mis-patrones` | Analiza historial de compras y genera insights |

> Si `GEMINI_API_KEY` no está configurada, estos endpoints retornarán error 500.

---

## 🔒 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| `comprador` | Ver productos/categorías, crear órdenes, ver sus órdenes, cambiar su password |
| `vendedor` | Todo lo de comprador + crear/editar/eliminar sus productos, usar IA para productos |
| `admin` | Acceso completo a todos los endpoints |
