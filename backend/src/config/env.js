/* Centraliza a configuração do dotenv e valida as variáveis essenciais */
require('dotenv').config()

const requiredKeys = ['MONGO_URI', 'JWT_SECRET']

requiredKeys.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️  Variável de ambiente ${key} não definida.`)
  }
})

module.exports = {
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
}

