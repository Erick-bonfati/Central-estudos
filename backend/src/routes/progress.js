const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const asyncHandler = require('../utils/asyncHandler')
const User = require('../models/User')
const { computeProgressSummary } = require('../utils/progress')

router.use(auth)

// GET /progress
// Calcula e também persiste o resumo no documento do usuário
router.get('/', asyncHandler(async (req, res) => {
  const summary = await computeProgressSummary(req.user.id)
  await User.findByIdAndUpdate(req.user.id, {
    progressSummary: summary,
    progressUpdatedAt: new Date()
  })
  res.json(summary)
}))

// GET /progress/cached -> retorna o que est salvo no usurio (se existir)
router.get('/cached', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('progressSummary progressUpdatedAt')
  if (!user || !user.progressSummary) {
    return res.status(404).json({ error: 'Resumo no encontrado' })
  }
  res.json({
    updatedAt: user.progressUpdatedAt,
    ...user.progressSummary
  })
}))

module.exports = router
