// src/pages/PomodoroPage.jsx
import React, { useState, useEffect } from 'react';
import styles from './PomodoroPage.module.css';

function PomodoroPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos em segundos
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'break', 'longBreak'
  const [sessionCount, setSessionCount] = useState(0);
  
  // Estados para tarefas
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Matemática - Álgebra', completed: false },
    { id: 2, name: 'História - Idade Média', completed: false },
    { id: 3, name: 'Português - Gramática', completed: false }
  ]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);

  const modes = {
    work: { duration: 25 * 60, label: 'Trabalho', color: '#e53e3e' },
    break: { duration: 5 * 60, label: 'Pausa Curta', color: '#38a169' },
    longBreak: { duration: 15 * 60, label: 'Pausa Longa', color: '#3182ce' }
  };

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer acabou
      setIsRunning(false);
      if (mode === 'work') {
        setSessionCount(sessionCount + 1);
        if (sessionCount + 1 >= 4) {
          setMode('longBreak');
          setTimeLeft(modes.longBreak.duration);
          setSessionCount(0);
        } else {
          setMode('break');
          setTimeLeft(modes.break.duration);
        }
      } else {
        setMode('work');
        setTimeLeft(modes.work.duration);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, sessionCount, modes]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modes[mode].duration);
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(modes[newMode].duration);
  };

  // Funções para gerenciar tarefas
  const addTask = () => {
    if (newTaskName.trim()) {
      const newTask = {
        id: Date.now(),
        name: newTaskName.trim(),
        completed: false
      };
      setTasks([...tasks, newTask]);
      setNewTaskName('');
      setShowTaskForm(false);
    }
  };

  const selectTask = (task) => {
    setSelectedTask(task);
  };

  const completeTask = () => {
    if (selectedTask) {
      setTasks(tasks.map(task => 
        task.id === selectedTask.id 
          ? { ...task, completed: true }
          : task
      ));
      setSelectedTask(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((modes[mode].duration - timeLeft) / modes[mode].duration) * 100;

  return (
    <div className={styles.pomodoroPage}>
      <div className={styles.pomodoroHeader}>
        <h1>Timer Pomodoro</h1>
        <p>Sessões completadas: {sessionCount}</p>
      </div>

      <div className={styles.pomodoroContainer}>
        {/* Seção de Tarefas */}
        <div className={styles.taskSection}>
          <h3>Selecione uma tarefa para focar:</h3>
          
          {selectedTask && (
            <div className={styles.selectedTask}>
              <span className={styles.taskLabel}>Tarefa ativa:</span>
              <span className={styles.taskName}>{selectedTask.name}</span>
              <button 
                className={styles.completeBtn}
                onClick={completeTask}
              >
                ✓ Concluir
              </button>
            </div>
          )}

          <div className={styles.taskList}>
            {tasks.filter(task => !task.completed).map(task => (
              <button
                key={task.id}
                className={`${styles.taskBtn} ${selectedTask?.id === task.id ? styles.selected : ''}`}
                onClick={() => selectTask(task)}
              >
                {task.name}
              </button>
            ))}
          </div>

          <button 
            className={styles.addTaskBtn}
            onClick={() => setShowTaskForm(!showTaskForm)}
          >
            {showTaskForm ? 'Cancelar' : '+ Nova Tarefa'}
          </button>

          {showTaskForm && (
            <div className={styles.taskForm}>
              <input
                type="text"
                placeholder="Nome da nova tarefa"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                className={styles.taskInput}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />
              <button className={styles.saveTaskBtn} onClick={addTask}>
                Salvar
              </button>
            </div>
          )}
        </div>

        <div className={styles.modeSelector}>
          <button 
            className={`${styles.modeBtn} ${mode === 'work' ? styles.active : ''}`}
            onClick={() => switchMode('work')}
          >
            Trabalho
          </button>
          <button 
            className={`${styles.modeBtn} ${mode === 'break' ? styles.active : ''}`}
            onClick={() => switchMode('break')}
          >
            Pausa Curta
          </button>
          <button 
            className={`${styles.modeBtn} ${mode === 'longBreak' ? styles.active : ''}`}
            onClick={() => switchMode('longBreak')}
          >
            Pausa Longa
          </button>
        </div>

        <div className={styles.timerDisplay}>
          <div className={styles.timerCircle}>
            <svg className={styles.progressRing} width="300" height="300">
              <circle
                className="progress-ring-circle-bg"
                stroke="#e2e8f0"
                strokeWidth="8"
                fill="transparent"
                r="140"
                cx="150"
                cy="150"
              />
              <circle
                className="progress-ring-circle"
                stroke={modes[mode].color}
                strokeWidth="8"
                fill="transparent"
                r="140"
                cx="150"
                cy="150"
                style={{
                  strokeDasharray: `${2 * Math.PI * 140}`,
                  strokeDashoffset: `${2 * Math.PI * 140 * (1 - progress / 100)}`,
                  transition: 'stroke-dashoffset 1s ease-in-out'
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
          <button 
            className="btn control-btn"
            onClick={isRunning ? pauseTimer : startTimer}
          >
            {isRunning ? 'Pausar' : 'Iniciar'}
          </button>
          <button 
            className="btn control-btn secondary"
            onClick={resetTimer}
          >
            Resetar
          </button>
        </div>

        <div className={styles.pomodoroInfo}>
          <div className={styles.infoCard}>
            <h3>Como funciona?</h3>
            <ul>
              <li>⏰ Trabalhe por 25 minutos</li>
              <li>☕ Faça uma pausa de 5 minutos</li>
              <li>🔄 Repita 4 vezes</li>
              <li>🏖️ Faça uma pausa longa de 15 minutos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PomodoroPage;