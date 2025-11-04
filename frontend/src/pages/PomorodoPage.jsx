import React, { useState, useEffect, useRef } from "react"
import styles from "./PomodoroPage.module.css"
import { taskService } from "../services/taskService"
import { useBeforeUnload, useLocation } from "react-router-dom"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"

const sounds = {
  start: "/sounds/start.wav",
  pause: "/sounds/pause.wav",
  warning: "/sounds/warning.wav",
  end: "/sounds/end.wav"
}

function PomodoroPage() {
  const [mode, setMode] = useState("work")
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [newTaskName, setNewTaskName] = useState("")
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [stats, setStats] = useState({ daily: 0, weekly: 0, monthly: 0, activeDays: 0, streak: 0, weeklyChart: [] })
  const [loggedMinutes, setLoggedMinutes] = useState(0)
  const [endTime, setEndTime] = useState(null)
  const location = useLocation()
  const stayUrlRef = useRef(window.location.href)

  useBeforeUnload(
    (event) => {
      if (isRunning) {
        event.preventDefault()
        event.returnValue = ""
      }
    },
    isRunning
  )

  useEffect(() => {
    stayUrlRef.current = window.location.href
  }, [location])

  useEffect(() => {
    if (!isRunning) return

    const message = "O timer está em execução. Deseja sair desta página?"
    const originalPush = window.history.pushState
    const originalReplace = window.history.replaceState

    const confirmExit = () => window.confirm(message)

    const handlePopState = () => {
      if (confirmExit()) {
        cleanup()
      } else {
        originalPush.call(window.history, window.history.state, document.title, stayUrlRef.current)
        stayUrlRef.current = window.location.href
      }
    }

    const cleanup = () => {
      window.history.pushState = originalPush
      window.history.replaceState = originalReplace
      window.removeEventListener("popstate", handlePopState)
    }

    window.history.pushState = function (...args) {
      if (confirmExit()) {
        cleanup()
        return originalPush.apply(window.history, args)
      }
    }

    window.history.replaceState = function (...args) {
      if (confirmExit()) {
        cleanup()
        return originalReplace.apply(window.history, args)
      }
    }

    window.addEventListener("popstate", handlePopState)

    return cleanup
  }, [isRunning, location])

  const modes = {
    work: { duration: 25 * 60, label: "Trabalho", color: "#e53e3e" },
    break: { duration: 5 * 60, label: "Pausa Curta", color: "#38a169" },
    longBreak: { duration: 15 * 60, label: "Pausa Longa", color: "#3182ce" },
  }

  const playSound = (name) => {
    const audio = new Audio(sounds[name])
    audio.volume = 0.6
    audio.play().catch(() => {})
  }

  useEffect(() => { loadTasks() }, [])

  const loadTasks = async () => {
    try {
      const data = await taskService.getTasks()
      setTasks(data)
      setSelectedTask(prev => {
        if (!prev) return null
        const updated = data.find(t => t._id === prev._id)
        return updated || null
      })
      calculateStats(data)
    } catch (err) {
      console.error(err)
    }
  }

  const calculateStats = (tasks) => {
    const now = new Date()
    const todayKey = now.toISOString().slice(0, 10)
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(now.getDate() - (6 - i))
      return d
    })
    const keys = days.map(d => d.toISOString().slice(0, 10))
    const minutes = Object.fromEntries(keys.map(k => [k, 0]))
    let daily = 0, monthly = 0

    const sessions = [
      ...tasks.flatMap(t => t.sessions || []),
      ...(JSON.parse(localStorage.getItem("pomodoroFreeSessions") || "[]"))
    ]

    for (const s of sessions) {
      const d = new Date(s.date)
      const key = d.toISOString().slice(0, 10)
      const mins = Number(s.duration) || 0
      if (key === todayKey) daily += mins
      if (keys.includes(key)) minutes[key] += mins
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) monthly += mins
    }

    const weekly = Object.values(minutes).reduce((a, b) => a + b, 0)
    const weeklyChart = keys.map((k, i) => ({
      day: days[i].toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }).replace(".", ""),
      minutes: minutes[k]
    }))
    const activeDays = weeklyChart.filter(d => d.minutes > 0).length
    let streak = 0
    for (let i = weeklyChart.length - 1; i >= 0; i--) {
      if (weeklyChart[i].minutes > 0) streak++
      else break
    }

    setStats({ daily, weekly, monthly, activeDays, streak, weeklyChart })
  }

  const addFreeSession = (minutes) => {
    const free = JSON.parse(localStorage.getItem("pomodoroFreeSessions") || "[]")
    free.push({ date: new Date().toISOString(), duration: minutes })
    localStorage.setItem("pomodoroFreeSessions", JSON.stringify(free))
  }

  const startTimer = () => {
    playSound("start")
    setEndTime(Date.now() + timeLeft * 1000)
    setIsRunning(true)
  }

  const pauseTimer = async () => {
    if (mode === "work") await saveElapsedTime()
    if (endTime) {
      const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000))
      setTimeLeft(remaining)
      setEndTime(null)
    }
    playSound("pause")
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(modes[mode].duration)
    if (mode === "work") setLoggedMinutes(0)
    setEndTime(null)
  }

  const switchMode = (m) => {
    setIsRunning(false)
    setMode(m)
    setTimeLeft(modes[m].duration)
    if (m === "work") setLoggedMinutes(0)
    setEndTime(null)
  }

  const saveElapsedTime = async () => {
    const elapsed = Math.floor((modes.work.duration - timeLeft) / 60)
    const delta = Math.max(0, elapsed - loggedMinutes)
    if (delta < 1) return

    try {
      if (selectedTask) {
        await taskService.addSession(selectedTask._id, delta)
      } else {
        addFreeSession(delta)
      }
      setLoggedMinutes(prev => prev + delta)
      loadTasks()
    } catch (e) {
      console.error(e)
    }
  }

  const handleSessionEnd = async () => {
    await saveElapsedTime()
    if (mode === "work") {
      setSessionCount(c => (c + 1) % 4)
      const next = sessionCount + 1 >= 4 ? "longBreak" : "break"
      switchMode(next)
    } else {
      switchMode("work")
    }
  }

  useEffect(() => {
    if (!isRunning || !endTime) return
    let prev = timeLeft
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000))
      if (prev > 5 * 60 && remaining <= 5 * 60 && remaining > 0) playSound("warning")
      if (remaining === 0 && prev > 0) playSound("end")
      setTimeLeft(remaining)
      prev = remaining
      if (remaining === 0) {
        setIsRunning(false)
        setEndTime(null)
        handleSessionEnd()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, endTime])

  useEffect(() => {
    const onVis = () => {
      if (isRunning && endTime) {
        const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000))
        setTimeLeft(remaining)
      }
    }
    document.addEventListener("visibilitychange", onVis)
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [isRunning, endTime])

  const addTask = async () => {
    if (!newTaskName.trim()) return
    const task = await taskService.createTask(newTaskName.trim())
    setTasks([...tasks, task])
    setNewTaskName("")
    setShowTaskForm(false)
  }

  const manageCard = async (action, taskId, ...args) => {
    try {
      if (action === "add") await taskService.addCard(taskId, args[0])
      if (action === "toggle") await taskService.updateCard(taskId, args[0], args[1])
      if (action === "delete") await taskService.deleteCard(taskId, args[0])
      loadTasks()
    } catch (err) {
      console.error(err)
    }
  }

  const completeTask = async () => {
    if (!selectedTask) return
    await taskService.updateTask(selectedTask._id, true)
    setSelectedTask(null)
    loadTasks()
  }

  const progress = ((modes[mode].duration - timeLeft) / modes[mode].duration) * 100
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  useEffect(() => {
    if (isRunning) {
      document.title = formatTime(timeLeft)
    } else {
      document.title = "Central De Estudos"
    }
  }, [isRunning, timeLeft])

  useEffect(() => {
    return () => {
      document.title = "Central De Estudos"
    }
  }, [])


  return (
    <div className={styles.pomodoroPage}>
      <div className={styles.statsToggle}>
        <button className={styles.toggleBtn} onClick={() => setShowStats(!showStats)}>
          {showStats ? "Ocultar estatísticas ▲" : "Mostrar estatísticas ▼"}
        </button>
      </div>

      {showStats && (
        <div className={styles.statsOverlay} onClick={() => setShowStats(false)}>
          <div className={styles.statsSection} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setShowStats(false)}>×</button>
            <h2 className={styles.statsTitle}>Resumo de atividades</h2>

            <div className={styles.statsSummary}>
              <div className={styles.statBox}>
                <span className={styles.statValue}>
                  {Math.floor(stats.monthly) >= 60
                    ? `${Math.floor(stats.monthly / 60)}h${Math.floor(stats.monthly % 60) ? `${Math.floor(stats.monthly % 60)}min` : ""}`
                    : `${Math.max(0, Math.floor(stats.monthly))}`}
                </span>
                <span className={styles.statLabel}>Minutos focados (mês)</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>{stats.activeDays || 0}</span>
                <span className={styles.statLabel}>Dias ativos (7d)</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>{stats.streak || 0}</span>
                <span className={styles.statLabel}>Dias seguidos</span>
              </div>
            </div>

            <h3 className={styles.chartTitle}>Minutos focados (últimos 7 dias)</h3>
            <div className={styles.chartWrapper}>
              {stats.weeklyChart?.some(d => d.minutes > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.weeklyChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="minutes" fill="#6c63ff" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', color: '#666' }}>Sem dados ainda</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={styles.pomodoroHeader}>
        <h1>Timer Pomodoro</h1>
        <p>Sessões completadas: {sessionCount}</p>
      </div>

      <div className={styles.pomodoroContainer}>
        <div className={styles.modeSelector}>
          {Object.keys(modes).map((k) => (
            <button
              key={k}
              className={`${styles.modeBtn} ${mode === k ? styles.active : ""}`}
              onClick={() => switchMode(k)}
            >
              {modes[k].label}
            </button>
          ))}
        </div>

        <div className={styles.timerDisplay}>
          <div className={styles.timerCircle}>
            <svg className={styles.progressRing} width="300" height="300">
              <circle stroke="#e2e8f0" strokeWidth="8" fill="transparent" r="140" cx="150" cy="150" />
              <circle
                stroke={modes[mode].color}
                strokeWidth="8"
                fill="transparent"
                r="140"
                cx="150"
                cy="150"
                style={{
                  strokeDasharray: `${2 * Math.PI * 140}`,
                  strokeDashoffset: `${2 * Math.PI * 140 * (1 - progress / 100)}`,
                  transition: "stroke-dashoffset 1s ease-in-out",
                }}
              />
            </svg>
            <div className={styles.timerContent}>
              <div className={styles.timerTime}>{formatTime(timeLeft)}</div>
              <div className={styles.timerMode}>{modes[mode].label}</div>
            </div>
          </div>
        </div>

        <div className={styles.timerControls}>
          <button className="btn control-btn" onClick={isRunning ? pauseTimer : startTimer}>
            {isRunning ? "Pausar" : "Iniciar"}
          </button>
          <button className="btn control-btn secondary" onClick={resetTimer}>
            Resetar
          </button>
        </div>

        <div className={styles.taskSection}>
          <h3>Tarefas</h3>

          {selectedTask && (
            <div className={styles.selectedTask}>
              <span className={styles.taskLabel}>Tarefa ativa:</span>
              <span className={styles.taskName}>{selectedTask.name}</span>
              <button className={styles.completeBtn} onClick={completeTask}>✓ Concluir</button>
            </div>
          )}

          <div className={styles.taskList}>
            {tasks.filter(t => !t.completed).map(task => (
              <button
                key={task._id}
                className={`${styles.taskBtn} ${selectedTask?._id === task._id ? styles.selected : ""}`}
                onClick={() => setSelectedTask(task)}
              >
                {task.name}
              </button>
            ))}
          </div>

          {selectedTask && (
            <div className={styles.cardsWrapper}>
              <h4>Cards da tarefa</h4>
              <ul className={styles.cardsList}>
                {(selectedTask.cards || []).map((card, i) => (
                  <li key={i} className={`${styles.cardItem} ${card.done ? styles.checked : ""}`}>
                    <div className={styles.cardLabel}>
                      <input
                        type="checkbox"
                        checked={card.done}
                        onChange={() => manageCard("toggle", selectedTask._id, i, !card.done)}
                      />
                      <span className={`${card.done ? styles.cardDone : ""} ${styles.cardTitle}`}>
                        {card.title.length > 25 ? card.title.slice(0, 25) + "…" : card.title}
                      </span>
                    </div>
                    <button
                      className={styles.deleteCardBtn}
                      onClick={() => manageCard("delete", selectedTask._id, i)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <div className={styles.addCard}>
                <input
                  type="text"
                  placeholder="Adicionar item..."
                  className={styles.cardInput}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && e.target.value.trim()) {
                      await manageCard("add", selectedTask._id, e.target.value)
                      e.target.value = ""
                    }
                  }}
                />
              </div>
            </div>
          )}

          <button className={styles.addTaskBtn} onClick={() => setShowTaskForm(!showTaskForm)}>
            {showTaskForm ? "Cancelar" : "+ Nova Tarefa"}
          </button>

          {showTaskForm && (
            <div className={styles.taskForm}>
              <input
                type="text"
                placeholder="Nome da nova tarefa"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                className={styles.taskInput}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
              />
              <button className={styles.saveTaskBtn} onClick={addTask}>
                Salvar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PomodoroPage
