const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config/env')

module.exports = function (req, res, next) {
  if (!jwtSecret) {
    console.error('JWT_SECRET não configurado')
    return res.status(500).json({ error: 'Configuração do token ausente' })
  }

  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Token não enviado' })

  const [, token] = authHeader.split(' ')
  try {
    const decoded = jwt.verify(token, jwtSecret)
    req.user = decoded // guarda o id do usuário
    next()
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' })
  }
}
