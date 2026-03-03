import multer from 'multer';
import path from 'path';
import fs from 'fs';

const crearDirectorios = () => {
  const directorios = ['uploads', 'uploads/productos', 'uploads/usuarios'];
  directorios.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    crearDirectorios();
    let carpeta = 'uploads/productos';
    if (file.fieldname === 'avatar_usuario' || file.fieldname === 'imagen_icono') {
      carpeta = 'uploads/usuarios';
    }
    cb(null, carpeta);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    cb(null, `${timestamp}-${random}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan: JPG, PNG, WEBP'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
    files: 5
  }
});

export const subirImagenProducto = upload.single('imagen_producto');
export const subirAvatarUsuario = upload.single('avatar_usuario');
export const subirIconoCategoria = upload.single('imagen_icono');
