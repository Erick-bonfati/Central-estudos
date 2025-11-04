const express = require('express')
const router = express.Router()
const Task = require('../models/Task')
const auth = require('../middleware/auth')
const asyncHandler = require('../utils/asyncHandler')

const notFound = (message) => {
  const error = new Error(message)
  error.statusCode = 404
  return error
}

const badRequest = (message) => {
  const error = new Error(message)
  error.statusCode = 400
  return error
}

const findUserTask = async (userId, taskId) => {
  const task = await Task.findOne({ _id: taskId, user: userId })
  if (!task) throw notFound('Tarefa não encontrada')
  return task
}

const parseCardIndex = (value) => {
  const index = Number(value)
  if (!Number.isInteger(index) || index < 0) {
    throw badRequest('Índice do card inválido')
  }
  return index
}

router.use(auth)

// listar tarefas do usuário logado
router.get('/', asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user.id })
  res.json(tasks)
}))

// criar nova tarefa
router.post('/', asyncHandler(async (req, res) => {
  const name = (req.body.name || '').trim()
  if (!name) {
    throw badRequest('Nome da tarefa é obrigatório')
  }

  const newTask = await Task.create({ name, user: req.user.id })
  res.status(201).json(newTask)
}))

// marcar como concluída
router.put('/:id', asyncHandler(async (req, res) => {
  if (typeof req.body.completed !== 'boolean') {
    throw badRequest('Valor de completed inválido')
  }

  const updated = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { completed: req.body.completed },
    { new: true }
  )

  if (!updated) throw notFound('Tarefa não encontrada')
  res.json(updated)
}))

// deletar
router.delete('/:id', asyncHandler(async (req, res) => {
  const deleted = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id })
  if (!deleted) throw notFound('Tarefa não encontrada')
  res.json({ message: 'Tarefa removida com sucesso' })
}))

// adicionar card
router.post('/:id/cards', asyncHandler(async (req, res) => {
  const title = (req.body.title || '').trim()
  if (!title) throw badRequest('Título do card é obrigatório')

  const task = await findUserTask(req.user.id, req.params.id)
  task.cards.push({ title })
  await task.save()
  res.status(201).json(task)
}))

// atualizar card
router.put('/:taskId/cards/:cardIndex', asyncHandler(async (req, res) => {
  if (typeof req.body.done !== 'boolean') {
    throw badRequest('Valor de done inválido')
  }

  const task = await findUserTask(req.user.id, req.params.taskId)
  const index = parseCardIndex(req.params.cardIndex)

  if (!task.cards[index]) throw notFound('Card não encontrado')

  task.cards[index].done = req.body.done
  await task.save()
  res.json(task)
}))

// deletar card
router.delete('/:id/cards/:cardIndex', asyncHandler(async (req, res) => {
  const task = await findUserTask(req.user.id, req.params.id)
  const index = parseCardIndex(req.params.cardIndex)

  if (index >= task.cards.length) throw notFound('Card não encontrado')

  task.cards.splice(index, 1)
  await task.save()
  res.json(task)
}))

// registrar sessão concluída (minutos)
router.put('/:id/sessions', asyncHandler(async (req, res) => {
  const minutes = Number(req.body.duration)
  if (!minutes || minutes <= 0) {
    throw badRequest('Duração inválida')
  }

  const task = await findUserTask(req.user.id, req.params.id)
  task.sessions = task.sessions || []
  task.sessions.push({ duration: minutes })
  await task.save()

  res.json({ success: true })
}))

module.exports = router
