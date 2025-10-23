const mongoose = require('mongoose')

const CardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  done: { type: Boolean, default: false }
})

const SessionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  // duração em minutos
  duration: { type: Number, required: true, min: 1 }
})

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cards: [CardSchema],
  sessions: [SessionSchema]
}, { timestamps: true })

module.exports = mongoose.model('Task', TaskSchema)
