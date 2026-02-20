const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

async function conectarMongo() {
    try {
        await mongoose.connect(uri);
        console.log('Conectado exitosamente a MongoDB con Mongoose');
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
        throw error;
    }
}

module.exports = { conectarMongo };
