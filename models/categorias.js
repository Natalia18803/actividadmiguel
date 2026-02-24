import mongose from 'mongoose';

const categoriaSchema = new mongose.Schema({
    nombre: {
        type: String,
        required: true, 
    },
    descripcion: {
        type: String,
        required: true, 
    },
    Imagen: {
        type: String,
        required: true,         
    }

});

const categoria = mongose.model('Categoria', categoriaSchema);
export default categoria;