const mongoose = require('mongoose')
const { mongoUri } = require('./env')

async function connectDB() {
  try {
    if (!mongoUri) {
      throw new Error('MONGO_URI não configurado')
    }
    await mongoose.connect(mongoUri)
    console.log('✅ Conectado ao MongoDB')
  } catch (err) {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB
