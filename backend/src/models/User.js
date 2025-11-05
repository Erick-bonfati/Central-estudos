const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const ProgressTaskSchema = new mongoose.Schema({
  taskId: String,
  name: String,
  totalMinutes: Number
}, { _id: false })

const ProgressSummarySchema = new mongoose.Schema({
  perTask: [ProgressTaskSchema],
  daily: [{ date: String, minutes: Number }],
  weekly: [{ weekStart: String, minutes: Number }],
  monthly: [{ month: String, minutes: Number }],
  totals: {
    todayMinutes: { type: Number, default: 0 },
    thisWeekMinutes: { type: Number, default: 0 },
    thisMonthMinutes: { type: Number, default: 0 },
    allTimeMinutes: { type: Number, default: 0 }
  }
}, { _id: false })

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  progressSummary: { type: ProgressSummarySchema, default: undefined },
  progressUpdatedAt: { type: Date }
})

// antes de salvar, criptografa a senha
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

module.exports = mongoose.model('User', UserSchema)
