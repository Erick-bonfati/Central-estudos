require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./src/config/db')
const authRoutes = require('./src/routes/auth')
const taskRoutes = require('./src/routes/tasks')

const app = express()

connectDB()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.json({ message: 'API da Central de Estudos 🚀' }))
app.use('/auth', authRoutes)
app.use('/tasks', taskRoutes)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`✅ Servidor rodando em http://localhost:${PORT}`))
