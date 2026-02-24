import mongose from 'mongoose';

const userSchema = new mongose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    rol: {
        type: String,
        enum: ['comprador', 'vendedor'],
        default: 'comprador'
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});


const user = mongose.model('User', userSchema);

export default user;





