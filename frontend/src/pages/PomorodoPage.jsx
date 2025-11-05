import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import styles from "./PomodoroPage.module.css";
import { useTasks } from "../hooks/useTasks";
import { useExitWarning } from "../hooks/useExitWarning";
import { AuthContext } from "../context/AuthContext";
import { progressService } from "../services/progressService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SOUNDS = {
  start: "/sounds/start.wav",
  pause: "/sounds/pause.wav",
  warning: "/sounds/warning.wav",
  end: "/sounds/end.wav",
};

const MODES = {
  work: { duration: 25 * 60, label: "Trabalho", color: "#e53e3e" },
  break: { duration: 5 * 60, label: "Pausa Curta", color: "#38a169" },
  longBreak: { duration: 15 * 60, label: "Pausa Longa", color: "#3182ce" },
};

function playSound(name) {
  const audio = new Audio(SOUNDS[name]);
  audio.volume = 0.6;
  audio.play().catch(() => {});
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatMonthlyMinutes(totalMinutes) {
  const minutes = Math.max(0, Math.floor(totalMinutes));
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return `${hours}h${rest ? `${rest}min` : ""}`;
  }
  return `${minutes}`;
}

function getStoredFreeSessions() {
  try {
    return JSON.parse(localStorage.getItem("pomodoroFreeSessions") || "[]");
  } catch {
    return [];
  }
}

function calculateStats(tasks, includeLocal = true) {
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(now.getDate() - (6 - index));
    return date;
  });

  const keys = days.map((date) => date.toISOString().slice(0, 10));
  const minutesPerDay = Object.fromEntries(keys.map((key) => [key, 0]));
  let daily = 0;
  let monthly = 0;

  const sessions = [
    ...tasks.flatMap((task) => task.sessions || []),
    ...(includeLocal ? getStoredFreeSessions() : []),
  ];

  for (const session of sessions) {
    const when = new Date(session.date);
    const key = when.toISOString().slice(0, 10);
    const duration = Number(session.duration) || 0;
    if (!duration) continue;

    if (key === todayKey) daily += duration;
    if (keys.includes(key)) minutesPerDay[key] += duration;

    const sameMonth =
      when.getMonth() === now.getMonth() && when.getFullYear() === now.getFullYear();
    if (sameMonth) monthly += duration;
  }

  const weekly = Object.values(minutesPerDay).reduce((total, value) => total + value, 0);
  const weeklyChart = keys.map((key, index) => ({
    day: days[index]
      .toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })
      .replace(".", ""),
    minutes: minutesPerDay[key],
  }));

  const activeDays = weeklyChart.filter((item) => item.minutes > 0).length;
  let streak = 0;
  for (let i = weeklyChart.length - 1; i >= 0; i -= 1) {
    if (weeklyChart[i].minutes > 0) streak += 1;
    else break;
  }

  return { daily, weekly, monthly, activeDays, streak, weeklyChart };
}

function StatsOverlay({ stats, visible, onClose }) {
  if (!visible) return null;

  return (
    <div className={styles.statsOverlay} onClick={onClose}>
      <div className={styles.statsSection} onClick={(event) => event.stopPropagation()}>
        <button className={styles.closeModal} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.statsTitle}>Resumo de atividades</h2>

        <div className={styles.statsSummary}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{formatMonthlyMinutes(stats.monthly)}</span>
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
          {stats.weeklyChart?.some((item) => item.minutes > 0) ? (
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
            <div style={{ textAlign: "center", color: "#666" }}>Sem dados ainda</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModeSelector({ currentMode, onSelect }) {
  return (
    <div className={styles.modeSelector}>
      {Object.entries(MODES).map(([key, value]) => (
        <button
          key={key}
          className={`${styles.modeBtn} ${currentMode === key ? styles.active : ""}`}
          onClick={() => onSelect(key)}
        >
          {value.label}
        </button>
      ))}
    </div>
  );
}

function TimerDisplay({ mode, timeLeft, progress }) {
  const { color, label, duration } = MODES[mode];
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress / 100);

  return (
    <div className={styles.timerDisplay}>
      <div className={styles.timerCircle}>
        <svg className={styles.progressRing} width="300" height="300">
          <circle stroke="#e2e8f0" strokeWidth="8" fill="transparent" r={radius} cx="150" cy="150" />
          <circle
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            r={radius}
            cx="150"
            cy="150"
            style={{
              strokeDasharray: `${circumference}`,
              strokeDashoffset: `${offset}`,
              transition: "stroke-dashoffset 1s ease-in-out",
            }}
          />
        </svg>
        <div className={styles.timerContent}>
          <div className={styles.timerTime}>{formatTime(timeLeft)}</div>
          <div className={styles.timerMode}>{label}</div>
        </div>
      </div>
    </div>
  );
}

function TimerControls({ isRunning, onStart, onPause, onReset }) {
  return (
    <div className={styles.timerControls}>
      <button className="btn control-btn" onClick={isRunning ? onPause : onStart}>
        {isRunning ? "Pausar" : "Iniciar"}
      </button>
      <button className="btn control-btn secondary" onClick={onReset}>
        Resetar
      </button>
    </div>
  );
}

function TaskSection({
  tasks,
  selectedTask,
  onSelectTask,
  onCompleteTask,
  onCreateTask,
  onAddCard,
  onToggleCard,
  onDeleteCard,
}) {
  const [showForm, setShowForm] = useState(false);
  const [taskName, setTaskName] = useState("");

  const pendingTasks = tasks.filter((task) => !task.completed);

  const handleCreateTask = async () => {
    const name = taskName.trim();
    if (!name) return;
    const created = await onCreateTask(name);
    setTaskName("");
    setShowForm(false);
    if (created?._id) onSelectTask(created._id);
  };

  return (
    <div className={styles.taskSection}>
      <h3>Tarefas</h3>

      {selectedTask && (
        <div className={styles.selectedTask}>
          <span className={styles.taskLabel}>Tarefa ativa:</span>
          <span className={styles.taskName}>{selectedTask.name}</span>
          <button className={styles.completeBtn} onClick={onCompleteTask}>
            ✓ Concluir
          </button>
        </div>
      )}

      <div className={styles.taskList}>
        {pendingTasks.map((task) => (
          <button
            key={task._id}
            className={`${styles.taskBtn} ${
              selectedTask?._id === task._id ? styles.selected : ""
            }`}
            onClick={() => onSelectTask(task._id)}
          >
            {task.name}
          </button>
        ))}
      </div>

      {selectedTask && (
        <div className={styles.cardsWrapper}>
          <h4>Cards da tarefa</h4>
          <ul className={styles.cardsList}>
            {(selectedTask.cards || []).map((card, index) => (
              <li
                key={index}
                className={`${styles.cardItem} ${card.done ? styles.checked : ""}`}
              >
                <div className={styles.cardLabel}>
                  <input
                    type="checkbox"
                    checked={card.done}
                    onChange={() => onToggleCard(selectedTask._id, index, !card.done)}
                  />
                  <span className={`${styles.cardTitle} ${card.done ? styles.cardDone : ""}`}>
                    {card.title.length > 25 ? `${card.title.slice(0, 25)}…` : card.title}
                  </span>
                </div>
                <button
                  className={styles.deleteCardBtn}
                  onClick={() => onDeleteCard(selectedTask._id, index)}
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
              className={styles.cardInput}
              onKeyDown={async (event) => {
                if (event.key === "Enter" && event.target.value.trim()) {
                  await onAddCard(selectedTask._id, event.target.value);
                  event.target.value = "";
                }
              }}
            />
          </div>
        </div>
      )}

      <button className={styles.addTaskBtn} onClick={() => setShowForm((open) => !open)}>
        {showForm ? "Cancelar" : "+ Nova Tarefa"}
      </button>

      {showForm && (
        <div className={styles.taskForm}>
          <input
            type="text"
            placeholder="Nome da nova tarefa"
            value={taskName}
            onChange={(event) => setTaskName(event.target.value)}
            className={styles.taskInput}
            onKeyDown={(event) => event.key === "Enter" && handleCreateTask()}
          />
          <button className={styles.saveTaskBtn} onClick={handleCreateTask}>
            Salvar
          </button>
        </div>
      )}
    </div>
  );
}

function PomodoroPage() {
  const { tasks, createTask, updateTaskCompletion, addCard, updateCard, deleteCard, addSession, loadTasks } =
    useTasks();
  const { user } = useContext(AuthContext);

  const [mode, setMode] = useState("work");
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [loggedMinutes, setLoggedMinutes] = useState(0);
  const [freeSessionsVersion, setFreeSessionsVersion] = useState(0);
  const [stats, setStats] = useState(() => calculateStats([]));
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const endTimeRef = useRef(null);
  const previousTimeRef = useRef(MODES.work.duration);

  const selectedTask = useMemo(
    () => tasks.find((task) => task._id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  useExitWarning(isRunning);

  useEffect(() => {
    // ao logar, recarrega tarefas do servidor
    if (user) loadTasks();
  }, [user, loadTasks]);

  useEffect(() => {
    // Fallback local sempre atualizado; se logado, ignora sessões livres locais
    setStats(calculateStats(tasks, !user));
  }, [tasks, freeSessionsVersion, user]);

  useEffect(() => {
    // Se logado, busca resumo do backend e mapeia para o overlay
    if (!user) return;
    const buildWeeklyFromSummary = (dailyArr) => {
      const map = new Map(dailyArr.map((d) => [d.date, d.minutes]));
      const days = [];
      const now = new Date();
      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const label = d
          .toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })
          .replace(".", "");
        days.push({ key, label, minutes: Number(map.get(key) || 0) });
      }
      return days;
    };

    const load = async () => {
      try {
        const summary = await progressService.getProgress();
        const weeklyDays = buildWeeklyFromSummary(summary.daily || []);
        const weekly = weeklyDays.reduce((acc, item) => acc + item.minutes, 0);
        const daily = weeklyDays[6]?.minutes || 0;
        const monthly = summary?.totals?.thisMonthMinutes || 0;
        const activeDays = weeklyDays.filter((d) => d.minutes > 0).length;
        let streak = 0;
        for (let i = weeklyDays.length - 1; i >= 0; i -= 1) {
          if (weeklyDays[i].minutes > 0) streak += 1;
          else break;
        }
        const weeklyChart = weeklyDays.map((d) => ({ day: d.label, minutes: d.minutes }));
        setStats({ daily, weekly, monthly, activeDays, streak, weeklyChart });
      } catch (e) {
        // Silencia e mantém o fallback local
        console.warn("Falha ao carregar resumo do backend:", e?.message || e);
      }
    };

    load();
  }, [user, tasks, freeSessionsVersion]);

  useEffect(() => {
    if (!selectedTaskId) return;
    const exists = tasks.some((task) => task._id === selectedTaskId && !task.completed);
    if (!exists) setSelectedTaskId(null);
  }, [tasks, selectedTaskId]);

  const recordFreeSession = useCallback((minutes) => {
    const data = getStoredFreeSessions();
    data.push({ date: new Date().toISOString(), duration: Number(minutes) || 0 });
    localStorage.setItem("pomodoroFreeSessions", JSON.stringify(data));
    setFreeSessionsVersion((value) => value + 1);
  }, []);

  const persistElapsedMinutes = useCallback(async () => {
    if (mode !== "work") return;

    const elapsed = Math.floor((MODES.work.duration - timeLeft) / 60);
    const delta = Math.max(0, elapsed - loggedMinutes);
    if (delta < 1) return;

    if (selectedTaskId) {
      await addSession(selectedTaskId, delta);
    } else if (user) {
      // se logado e sem tarefa selecionada, registra em uma tarefa "Sessões Livres"
      let freeTask = tasks.find((t) => t.name === "Sessões Livres" && !t.completed);
      if (!freeTask) {
        freeTask = await createTask("Sessões Livres");
      }
      if (freeTask && freeTask._id) {
        await addSession(freeTask._id, delta);
      } else {
        // fallback extremo
        recordFreeSession(delta);
      }
    } else {
      recordFreeSession(delta);
    }

    setLoggedMinutes((prev) => prev + delta);
  }, [mode, timeLeft, loggedMinutes, selectedTaskId, addSession, recordFreeSession, user, tasks, createTask]);

  const startTimer = useCallback(() => {
    playSound("start");
    endTimeRef.current = Date.now() + timeLeft * 1000;
    previousTimeRef.current = timeLeft;
    setIsRunning(true);
  }, [timeLeft]);

  const pauseTimer = useCallback(async () => {
    await persistElapsedMinutes();

    if (endTimeRef.current) {
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      previousTimeRef.current = remaining;
      endTimeRef.current = null;
    }

    playSound("pause");
    setIsRunning(false);
  }, [persistElapsedMinutes]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    endTimeRef.current = null;
    const baseDuration = MODES[mode].duration;
    setTimeLeft(baseDuration);
    previousTimeRef.current = baseDuration;
    if (mode === "work") setLoggedMinutes(0);
  }, [mode]);

  const switchMode = useCallback((nextMode) => {
    if (!MODES[nextMode]) return;
    setIsRunning(false);
    endTimeRef.current = null;
    setMode(nextMode);
    const duration = MODES[nextMode].duration;
    setTimeLeft(duration);
    previousTimeRef.current = duration;
    if (nextMode === "work") setLoggedMinutes(0);
  }, []);

  const handleSessionEnd = useCallback(async () => {
    await persistElapsedMinutes();

    if (mode === "work") {
      setSessionCount((count) => {
        const nextCount = (count + 1) % 4;
        const nextMode = count + 1 >= 4 ? "longBreak" : "break";
        switchMode(nextMode);
        return nextCount;
      });
    } else {
      switchMode("work");
    }
  }, [mode, persistElapsedMinutes, switchMode]);

  useEffect(() => {
    if (!isRunning || !endTimeRef.current) return undefined;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));

      if (previousTimeRef.current > 5 * 60 && remaining <= 5 * 60 && remaining > 0) {
        playSound("warning");
      }
      if (remaining === 0 && previousTimeRef.current > 0) {
        playSound("end");
      }

      setTimeLeft(remaining);
      previousTimeRef.current = remaining;

      if (remaining === 0) {
        setIsRunning(false);
        endTimeRef.current = null;
        handleSessionEnd();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, handleSessionEnd]);

  useEffect(() => {
    const handleVisibility = () => {
      if (isRunning && endTimeRef.current) {
        const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);
        previousTimeRef.current = remaining;
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isRunning]);

  useEffect(() => {
    document.title = isRunning ? formatTime(timeLeft) : "Central De Estudos";
    return () => {
      document.title = "Central De Estudos";
    };
  }, [isRunning, timeLeft]);

  const progress = useMemo(() => {
    const duration = MODES[mode].duration;
    return Math.min(100, ((duration - timeLeft) / duration) * 100);
  }, [mode, timeLeft]);

  const completeTask = useCallback(async () => {
    if (!selectedTaskId) return;
    await updateTaskCompletion(selectedTaskId, true);
    setSelectedTaskId(null);
  }, [selectedTaskId, updateTaskCompletion]);

  const handleAddCard = useCallback(
    async (taskId, title) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      await addCard(taskId, trimmed);
    },
    [addCard]
  );

  const handleToggleCard = useCallback(
    async (taskId, cardIndex, done) => {
      await updateCard(taskId, cardIndex, done);
    },
    [updateCard]
  );

  const handleDeleteCard = useCallback(
    async (taskId, cardIndex) => {
      await deleteCard(taskId, cardIndex);
    },
    [deleteCard]
  );

  const handleSelectTask = useCallback((taskId) => {
    setSelectedTaskId(taskId);
  }, []);

  const handleCreateTask = useCallback(
    async (name) => {
      return createTask(name);
    },
    [createTask]
  );

  return (
    <div className={styles.pomodoroPage}>
      <div className={styles.statsToggle}>
        <button className={styles.toggleBtn} onClick={() => setShowStats((open) => !open)}>
          {showStats ? "Ocultar estatísticas ▲" : "Mostrar estatísticas ▼"}
        </button>
      </div>

      <StatsOverlay stats={stats} visible={showStats} onClose={() => setShowStats(false)} />

      <div className={styles.pomodoroHeader}>
        <h1>Timer Pomodoro</h1>
        <p>Sessões completadas: {sessionCount}</p>
      </div>

      <div className={styles.pomodoroContainer}>
        <ModeSelector currentMode={mode} onSelect={switchMode} />
        <TimerDisplay mode={mode} timeLeft={timeLeft} progress={progress} />
        <TimerControls
          isRunning={isRunning}
          onStart={startTimer}
          onPause={pauseTimer}
          onReset={resetTimer}
        />

        <TaskSection
          tasks={tasks}
          selectedTask={selectedTask}
          onSelectTask={handleSelectTask}
          onCompleteTask={completeTask}
          onCreateTask={handleCreateTask}
          onAddCard={handleAddCard}
          onToggleCard={handleToggleCard}
          onDeleteCard={handleDeleteCard}
        />
      </div>
    </div>
  );
}

export default PomodoroPage;
