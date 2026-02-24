import mongose from 'mongoose';

const productSchema = new mongose.Schema({
    vendedor: {
        type: mongose.Schema.Types.ObjectId,
   },
    categorias: {
        type: [String],
        required: true,
        trim: true
    },
    nombre: {
        type: String,
        required: true, 
    },
    descripcion: {
        type: String,
        required: true,
    },

    stock: {
        type: Number,
        required: true,
        min: 0
    },
    precio: {
        type: Number,
        required: true,
        min: 0
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
     });

    
     const product = mongose.model('Product', productSchema);

     export default product;