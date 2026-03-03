export const parsearLista = (valor, tipo = 'string') => {
  if (!valor) return null;
  const lista = valor.split(',').map(item => item.trim()).filter(Boolean);
  switch (tipo) {
    case 'int':
      return lista.map(item => parseInt(item)).filter(num => !isNaN(num));
    case 'float':
      return lista.map(item => parseFloat(item)).filter(num => !isNaN(num));
    default:
      return lista;
  }
};

export const parsearOrdenamiento = (orden) => {
  if (!orden) return {};
  const camposPermitidos = ['precio', 'fecha_creacion', 'nombre', 'stock'];
  const sortObj = {};
  orden.split(',').forEach(item => {
    const [campo, direccion = 'desc'] = item.trim().split(':');
    if (camposPermitidos.includes(campo.toLowerCase())) {
      sortObj[campo.toLowerCase()] = direccion.toLowerCase() === 'asc' ? 1 : -1;
    }
  });
  return sortObj;
};

export const construirFiltrosProducto = (query) => {
  const filtros = {};

  if (query.categoria_id) filtros.categoria_id = query.categoria_id;
  if (query.vendedor_id) filtros.vendedor_id = query.vendedor_id;
  if (query.precio_min || query.precio_max) {
    filtros.precio = {};
    if (query.precio_min) filtros.precio.$gte = parseFloat(query.precio_min);
    if (query.precio_max) filtros.precio.$lte = parseFloat(query.precio_max);
  }
  if (query.en_stock === 'true') filtros.stock = { $gt: 0 };
  if (query.q) {
    filtros.$or = [
      { nombre: { $regex: query.q, $options: 'i' } },
      { descripcion: { $regex: query.q, $options: 'i' } }
    ];
  }

  return filtros;
};
