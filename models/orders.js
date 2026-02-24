import mongosee from 'mongoose';

const orderSchema = new mongosee.Schema({
    comprador: {
        type: mongosee.Schema.Types.ObjectId,       
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },

    estado: {
        type: String,
        enum: ['pendiente', 'completada', 'cancelada'],
        default: 'pendiente'
    },
    fechaOrden: {
        type: Date,
        default: Date.now
    }
});