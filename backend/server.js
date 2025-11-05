const express = require('express')
const cors = require('cors')
const connectDB = require('./src/config/db')
const authRoutes = require('./src/routes/auth')
const taskRoutes = require('./src/routes/tasks')
const progressRoutes = require('./src/routes/progress')
const { notFound, errorHandler } = require('./src/middleware/errorHandler')
const { port } = require('./src/config/env')

const app = express()

connectDB()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.json({ message: 'API da Central de Estudos 🚀' }))
app.use('/auth', authRoutes)
app.use('/tasks', taskRoutes)
app.use('/progress', progressRoutes)

app.use(notFound)
app.use(errorHandler)

app.listen(port, () => console.log(`✅ Servidor rodando em http://localhost:${port}`))
