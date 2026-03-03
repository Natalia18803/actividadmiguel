import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

class GeminiClient {
  constructor() {
    this.client = axios.create({
      baseURL: GEMINI_BASE_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async generarContenido(prompt, opciones = {}) {
    if (!GEMINI_API_KEY) throw new Error('API Key de Gemini no configurada');

    try {
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: opciones.temperatura || 0.7,
          topK: opciones.topK || 40,
          topP: opciones.topP || 0.95,
          maxOutputTokens: opciones.maxTokens || 1024
        }
      };

      const response = await this.client.post(
        `/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        payload
      );

      if (!response.data.candidates || response.data.candidates.length === 0) {
        throw new Error('No se recibió respuesta válida de Gemini');
      }

      const contenido = response.data.candidates[0].content.parts[0].text;
      return {
        contenido,
        metadata: { tokens_utilizados: response.data.usageMetadata?.totalTokenCount || 0 }
      };
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Límite de tasa de Gemini excedido. Intenta más tarde.');
      }
      throw new Error(`Error de Gemini: ${error.message}`);
    }
  }

  async generarDescripcionProducto(nombre, categoria, caracteristicas = '') {
    const prompt = `
Eres un copywriter experto en e-commerce. Genera una descripción atractiva y profesional para este producto:
PRODUCTO: ${nombre}
CATEGORÍA: ${categoria}
CARACTERÍSTICAS: ${caracteristicas}
INSTRUCCIONES:
- Máximo 200 palabras
- Destaca beneficios, no solo características
- Usa un tono persuasivo pero profesional
- Estructura en párrafos cortos
Responde SOLO con la descripción, sin explicaciones adicionales.
    `;
    const resultado = await this.generarContenido(prompt, { temperatura: 0.8, maxTokens: 300 });
    return resultado.contenido.trim();
  }

  async sugerirCategorias(nombreProducto, descripcion) {
    const prompt = `
Analiza este producto y sugiere las 3 categorías más apropiadas:
PRODUCTO: ${nombreProducto}
DESCRIPCIÓN: ${descripcion}
CATEGORÍAS DISPONIBLES:
- Electrónicos
- Ropa y Accesorios
- Hogar y Jardín
- Deportes y Aire Libre
- Salud y Belleza
- Libros y Medios
- Juguetes y Juegos
Responde con exactamente 3 categorías de la lista, separadas por comas, sin explicaciones.
    `;
    const resultado = await this.generarContenido(prompt, { temperatura: 0.3, maxTokens: 100 });
    return resultado.contenido.trim().split(',').map(c => c.trim());
  }

  async generarDescripcionCategoria(nombre) {
    const prompt = `
Eres un experto en e-commerce. Genera una descripción atractiva para esta categoría de marketplace:
CATEGORÍA: ${nombre}
INSTRUCCIONES:
- Máximo 100 palabras
- Describe qué tipo de productos incluye
- Usa un tono profesional y amigable
Responde SOLO con la descripción, sin explicaciones adicionales.
    `;
    const resultado = await this.generarContenido(prompt, { temperatura: 0.7, maxTokens: 150 });
    return resultado.contenido.trim();
  }

  async sugerirCategoriasRelacionadas(nombre, descripcion) {
    const prompt = `
Dado este nombre y descripción de categoría, sugiere 3 categorías relacionadas o complementarias:
CATEGORÍA: ${nombre}
DESCRIPCIÓN: ${descripcion}
Responde con exactamente 3 sugerencias, separadas por comas, sin explicaciones adicionales.
    `;
    const resultado = await this.generarContenido(prompt, { temperatura: 0.5, maxTokens: 100 });
    return resultado.contenido.trim().split(',').map(c => c.trim());
  }

  async analizarPatronCompras(ordenes) {
    const resumen = ordenes.map(orden => ({
      total: orden.total,
      fecha: orden.fecha_orden,
      productos: orden.detalles?.length || 0
    }));

    const prompt = `
Analiza estos patrones de compra y genera insights:
DATOS: ${JSON.stringify(resumen)}
GENERA:
1. Patrón de frecuencia de compra
2. Promedio de gasto por orden
3. Tendencias temporales
4. Recomendaciones para el usuario
Responde en formato JSON con esta estructura:
{
  "frecuencia": "descripción",
  "promedio_gasto": número,
  "tendencias": "descripción",
  "recomendaciones": ["recomendación1", "recomendación2"]
}
    `;

    try {
      const resultado = await this.generarContenido(prompt, { temperatura: 0.5, maxTokens: 400 });
      const clean = resultado.contenido.replace(/```json|```/g, '').trim();
      return JSON.parse(clean);
    } catch (error) {
      return {
        frecuencia: 'No se pudo analizar',
        promedio_gasto: 0,
        tendencias: 'Datos insuficientes',
        recomendaciones: []
      };
    }
  }
}

export default new GeminiClient();
