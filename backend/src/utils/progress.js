const Task = require('../models/Task')

const toISODate = (d) => {
  const dt = new Date(d)
  return dt.toISOString().slice(0, 10)
}

const startOfISOWeekUTC = (d) => {
  const date = new Date(d)
  const day = date.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setUTCDate(date.getUTCDate() + diff)
  date.setUTCHours(0, 0, 0, 0)
  return date.toISOString().slice(0, 10)
}

const monthKeyUTC = (d) => {
  const date = new Date(d)
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

async function computeProgressSummary(userId) {
  const tasks = await Task.find({ user: userId }).select('name sessions').lean()

  const perTask = []
  const dailyMap = new Map()
  const weeklyMap = new Map()
  const monthlyMap = new Map()

  let allTimeMinutes = 0
  let todayMinutes = 0
  let thisWeekMinutes = 0
  let thisMonthMinutes = 0

  const now = new Date()
  const todayKey = toISODate(now)
  const weekKeyRef = startOfISOWeekUTC(now)
  const monthKeyRef = monthKeyUTC(now)

  for (const t of tasks) {
    const sessions = Array.isArray(t.sessions) ? t.sessions : []
    const total = sessions.reduce((acc, s) => acc + (Number(s.duration) || 0), 0)
    perTask.push({ taskId: String(t._id), name: t.name, totalMinutes: total })
    allTimeMinutes += total

    for (const s of sessions) {
      const minutes = Number(s.duration) || 0
      const dayKey = toISODate(s.date || new Date())
      const wkKey = startOfISOWeekUTC(s.date || new Date())
      const mKey = monthKeyUTC(s.date || new Date())

      dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + minutes)
      weeklyMap.set(wkKey, (weeklyMap.get(wkKey) || 0) + minutes)
      monthlyMap.set(mKey, (monthlyMap.get(mKey) || 0) + minutes)

      if (dayKey === todayKey) todayMinutes += minutes
      if (wkKey === weekKeyRef) thisWeekMinutes += minutes
      if (mKey === monthKeyRef) thisMonthMinutes += minutes
    }
  }

  const daily = Array.from(dailyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .map(([date, minutes]) => ({ date, minutes }))

  const weekly = Array.from(weeklyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12)
    .map(([weekStart, minutes]) => ({ weekStart, minutes }))

  const monthly = Array.from(monthlyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12)
    .map(([month, minutes]) => ({ month, minutes }))

  return {
    perTask,
    daily,
    weekly,
    monthly,
    totals: { todayMinutes, thisWeekMinutes, thisMonthMinutes, allTimeMinutes }
  }
}

module.exports = { computeProgressSummary }

