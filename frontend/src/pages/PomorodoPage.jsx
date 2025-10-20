import React, { useState, useEffect } from "react"
import styles from "./PomodoroPage.module.css"
import { taskService } from "../services/taskService"

// Sons (coloca em /public/sounds/)
const startSound = "/sounds/start.wav"
const pauseSound = "/sounds/pause.wav"
const warningSound = "/sounds/warning.wav"
const endSound = "/sounds/end.wav"

function PomodoroPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState("work")
  const [sessionCount, setSessionCount] = useState(0)
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [newTaskName, setNewTaskName] = useState("")
  const [showTaskForm, setShowTaskForm] = useState(false)

  const modes = {
    work: { duration: 25 * 60, label: "Trabalho", color: "#e53e3e" },
    break: { duration: 5 * 60, label: "Pausa Curta", color: "#38a169" },
    longBreak: { duration: 15 * 60, label: "Pausa Longa", color: "#3182ce" },
  }

  // ==========================
  // CARREGAR TAREFAS
  // ==========================
  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const data = await taskService.getTasks()
      setTasks(data)
      if (selectedTask) {
        const updated = data.find((t) => t._id === selectedTask._id)
        setSelectedTask(updated || null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // ==========================
  // FUNÇÃO PARA TOCAR SOM
  // ==========================
  const playSound = (src) => {
    const audio = new Audio(src)
    audio.volume = 0.6
    audio.play().catch(() => {})
  }

  // ==========================
  // CONTROLE DO TIMER
  // ==========================
  const startTimer = () => {
    playSound(startSound)
    setIsRunning(true)
  }

  const pauseTimer = () => {
    playSound(pauseSound)
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(modes[mode].duration)
  }

  const switchMode = (m) => {
    setIsRunning(false)
    setMode(m)
    setTimeLeft(modes[m].duration)
  }

  useEffect(() => {
    let interval = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => {
          const newTime = t - 1

          // toca aviso quando faltar 5 minutos em QUALQUER modo
          if (newTime === 5 * 60) playSound(warningSound)

          // toca som de fim quando chegar a zero
          if (newTime === 0) playSound(endSound)

          return newTime
        })
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      // alterna modo automaticamente
      if (mode === "work") {
        setSessionCount((c) => (c + 1) % 4)
        const nextMode = sessionCount + 1 >= 4 ? "longBreak" : "break"
        setMode(nextMode)
        setTimeLeft(modes[nextMode].duration)
      } else {
        setMode("work")
        setTimeLeft(modes.work.duration)
      }
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, mode, sessionCount])

  // ==========================
  // FUNÇÕES DE TAREFAS E CARDS
  // ==========================
  const addTask = async () => {
    if (!newTaskName.trim()) return
    const newTask = await taskService.createTask(newTaskName.trim())
    setTasks([...tasks, newTask])
    setNewTaskName("")
    setShowTaskForm(false)
  }

  const addCard = async (taskId, title) => {
    if (!title.trim()) return
    await taskService.addCard(taskId, title.trim())
    await loadTasks()
  }

  const deleteCard = async (taskId, cardIndex) => {
    try {
      await taskService.deleteCard(taskId, cardIndex)
      await loadTasks()
    } catch (error) {
      console.error("Erro ao deletar card:", error)
    }
  }

  const toggleCardDone = async (taskId, cardIndex, done) => {
    await taskService.updateCard(taskId, cardIndex, done)
    await loadTasks()
  }

  const completeTask = async () => {
    if (!selectedTask) return
    await taskService.updateTask(selectedTask._id, true)
    await loadTasks()
    setSelectedTask(null)
  }

  // ==========================
  // LÓGICA VISUAL DO TIMER
  // ==========================
  const progress =
    ((modes[mode].duration - timeLeft) / modes[mode].duration) * 100

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`

  // ==========================
  // INTERFACE
  // ==========================
  return (
    <div className={styles.pomodoroPage}>
      <div className={styles.pomodoroHeader}>
        <h1>Timer Pomodoro</h1>
        <p>Sessões completadas: {sessionCount}</p>
      </div>

      <div className={styles.pomodoroContainer}>
        {/* Seleção de modo */}
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

        {/* Círculo do timer */}
        <div className={styles.timerDisplay}>
          <div className={styles.timerCircle}>
            <svg className={styles.progressRing} width="300" height="300">
              <circle
                stroke="#e2e8f0"
                strokeWidth="8"
                fill="transparent"
                r="140"
                cx="150"
                cy="150"
              />
              <circle
                stroke={modes[mode].color}
                strokeWidth="8"
                fill="transparent"
                r="140"
                cx="150"
                cy="150"
                style={{
                  strokeDasharray: `${2 * Math.PI * 140}`,
                  strokeDashoffset: `${
                    2 * Math.PI * 140 * (1 - progress / 100)
                  }`,
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

        {/* Controles */}
        <div className={styles.timerControls}>
          <button
            className="btn control-btn"
            onClick={isRunning ? pauseTimer : startTimer}
          >
            {isRunning ? "Pausar" : "Iniciar"}
          </button>
          <button className="btn control-btn secondary" onClick={resetTimer}>
            Resetar
          </button>
        </div>

        {/* Seção de tarefas */}
        <div className={styles.taskSection}>
          <h3>Tarefas</h3>

          {selectedTask && (
            <div className={styles.selectedTask}>
              <span className={styles.taskLabel}>Tarefa ativa:</span>
              <span className={styles.taskName}>{selectedTask.name}</span>
              <button className={styles.completeBtn} onClick={completeTask}>
                ✓ Concluir
              </button>
            </div>
          )}

          <div className={styles.taskList}>
            {tasks
              .filter((t) => !t.completed)
              .map((task) => (
                <button
                  key={task._id}
                  className={`${styles.taskBtn} ${
                    selectedTask?._id === task._id ? styles.selected : ""
                  }`}
                  onClick={() => setSelectedTask(task)}
                >
                  {task.name}
                </button>
              ))}
          </div>

          {/* Cards */}
          {selectedTask && (
            <div className={styles.cardsWrapper}>
              <h4>Cards da tarefa</h4>
              <ul className={styles.cardsList}>
                {(selectedTask.cards || []).map((card, index) => (
                  <li
                    key={index}
                    className={`${styles.cardItem} ${
                      card.done ? styles.checked : ""
                    }`}
                  >
                    <div className={styles.cardLabel}>
                      <input
                        type="checkbox"
                        checked={card.done}
                        onChange={() =>
                          toggleCardDone(selectedTask._id, index, !card.done)
                        }
                      />
                      <span
                        className={`${card.done ? styles.cardDone : ""} ${
                          styles.cardTitle
                        }`}
                      >
                        {card.title.length > 25
                          ? card.title.slice(0, 25) + "…"
                          : card.title}
                      </span>
                    </div>
                    <button
                      className={styles.deleteCardBtn}
                      onClick={() => deleteCard(selectedTask._id, index)}
                      title="Excluir card"
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
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && e.target.value.trim()) {
                      await addCard(selectedTask._id, e.target.value)
                      e.target.value = ""
                    }
                  }}
                  className={styles.cardInput}
                />
              </div>
            </div>
          )}
          
          {/* Criar nova tarefa */}
          <button
            className={styles.addTaskBtn}
            onClick={() => setShowTaskForm(!showTaskForm)}
          >
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
