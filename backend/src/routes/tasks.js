const express = require('express')
const router = express.Router()
const Task = require('../models/Task')
const auth = require('../middleware/auth')

// listar tarefas do usuário logado
router.get('/', auth, async (req, res) => {
  const tasks = await Task.find({ user: req.user.id })
  res.json(tasks)
})

// criar nova tarefa
router.post('/', auth, async (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Nome da tarefa é obrigatório' })
  const newTask = await Task.create({ name, user: req.user.id })
  res.status(201).json(newTask)
})

// marcar como concluída
router.put('/:id', auth, async (req, res) => {
  const { completed } = req.body
  const updated = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { completed },
    { new: true }
  )
  if (!updated) return res.status(404).json({ error: 'Tarefa não encontrada' })
  res.json(updated)
})

// deletar
router.delete('/:id', auth, async (req, res) => {
  const deleted = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id })
  if (!deleted) return res.status(404).json({ error: 'Tarefa não encontrada' })
  res.json({ message: 'Tarefa removida com sucesso' })
})

// adicionar card
router.post('/:id/cards', auth, async (req, res) => {
  const { title } = req.body
  const task = await Task.findOne({ _id: req.params.id, user: req.user.id })
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' })
  task.cards.push({ title })
  await task.save()
  res.status(201).json(task)
})

// atualizar card
router.put('/:taskId/cards/:cardIndex', auth, async (req, res) => {
  const { done } = req.body
  const task = await Task.findOne({ _id: req.params.taskId, user: req.user.id })
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' })
  if (!task.cards[req.params.cardIndex]) return res.status(404).json({ error: 'Card não encontrado' })
  task.cards[req.params.cardIndex].done = done
  await task.save()
  res.json(task)
})

// deletar card
router.delete('/:id/cards/:cardIndex', auth, async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user.id })
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' })
  const index = parseInt(req.params.cardIndex)
  if (isNaN(index) || index < 0 || index >= task.cards.length)
    return res.status(404).json({ error: 'Card inválido' })
  task.cards.splice(index, 1)
  await task.save()
  res.json({ success: true, message: 'Card deletado com sucesso' })
})
 
// registrar sessão concluída (minutos)
router.put('/:id/sessions', auth, async (req, res) => {
  try {
    const { duration } = req.body
    const minutes = Number(duration)
    if (!minutes || minutes <= 0) {
      return res.status(400).json({ error: 'Duração inválida' })
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user.id })
    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' })

    task.sessions = task.sessions || []
    task.sessions.push({ duration: minutes })
    await task.save()

    return res.json({ success: true })
  } catch (err) {
    console.error('Erro ao registrar sessão:', err)
    return res.status(500).json({ error: 'Erro interno' })
  }
})

module.exports = router