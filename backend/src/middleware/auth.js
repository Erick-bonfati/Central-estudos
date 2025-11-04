require('dotenv').config()
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Token não enviado' })

  const [, token] = authHeader.split(' ')
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded // guarda o id do usuário
    next()
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' })
  }
}
