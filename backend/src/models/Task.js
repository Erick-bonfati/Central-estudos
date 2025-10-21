const mongoose = require('mongoose')

const CardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  done: { type: Boolean, default: false }
})

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cards: [CardSchema]
}, { timestamps: true })

module.exports = mongoose.model('Task', TaskSchema)
