require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

// conecta ao banco
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err))


const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
  cards: [
    {
      title: String,
      done: { type: Boolean, default: false }
    }
  ]
}, { timestamps: true })

const Task = mongoose.model('Task', TaskSchema)


// rotas

// listar
app.get('/tasks', async (req, res) => {
  const tasks = await Task.find()
  res.json(tasks)
})

// criar
app.post('/tasks', async (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Nome da tarefa é obrigatório' })
  const newTask = await Task.create({ name })
  res.status(201).json(newTask)
})

// atualizar (marcar como concluída)
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params
  const { completed } = req.body
  const updated = await Task.findByIdAndUpdate(id, { completed }, { new: true })
  if (!updated) return res.status(404).json({ error: 'Tarefa não encontrada' })
  res.json(updated)
})

// deletar
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params
  const deleted = await Task.findByIdAndDelete(id)
  if (!deleted) return res.status(404).json({ error: 'Tarefa não encontrada' })
  res.json({ message: 'Tarefa removida com sucesso' })
})

// adicionar card dentro de uma tarefa
app.post('/tasks/:id/cards', async (req, res) => {
  const { id } = req.params
  const { title } = req.body
  const task = await Task.findById(id)
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' })

  task.cards.push({ title })
  await task.save()
  res.status(201).json(task)
})

// atualizar status de um card (marcar concluído)
app.put('/tasks/:taskId/cards/:cardIndex', async (req, res) => {
  const { taskId, cardIndex } = req.params
  const { done } = req.body
  const task = await Task.findById(taskId)
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' })

  if (!task.cards[cardIndex]) return res.status(404).json({ error: 'Card não encontrado' })
  task.cards[cardIndex].done = done
  await task.save()
  res.json(task)
})

// Deletar card
app.delete('/tasks/:id/cards/:cardIndex', async (req, res) => {
  const { id, cardIndex } = req.params
  const task = await Task.findById(id)

  if (!task) {
    return res.status(404).json({ error: 'Tarefa não encontrada' })
  }

  const index = parseInt(cardIndex)
  if (isNaN(index) || index < 0 || index >= task.cards.length) {
    return res.status(404).json({ error: 'Card não encontrado' })
  }

  task.cards.splice(index, 1)
  await task.save()

  res.json({ success: true, message: 'Card deletado com sucesso' })
})

// rota padrão
app.get('/', (req, res) => res.json({ message: 'API rodando com MongoDB 🚀' }))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`✅ Servidor em http://localhost:${PORT}`))
