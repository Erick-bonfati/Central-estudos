const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const asyncHandler = require('../utils/asyncHandler')
const { jwtSecret } = require('../config/env')

function ensureJwtSecret(res) {
  if (jwtSecret) return true
  res.status(500).json({ error: 'Configuração do token ausente' })
  return false
}

// registrar novo usuário
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' })
  }

  const userExists = await User.findOne({ email })
  if (userExists) {
    return res.status(400).json({ error: 'Email já registrado' })
  }

  const newUser = new User({ name, email, password })
  await newUser.save()

  res.status(201).json({ message: 'Usuário criado com sucesso' })
}))

// login
router.post('/login', asyncHandler(async (req, res) => {
  if (!ensureJwtSecret(res)) return

  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    return res.status(400).json({ error: 'Usuário não encontrado' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(400).json({ error: 'Senha incorreta' })
  }

  const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '7d' })

  res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
}))

module.exports = router
