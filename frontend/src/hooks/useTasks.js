import { useCallback, useEffect, useState } from "react";
import { taskService } from "../services/taskService";

function updateListWithTask(tasks, updatedTask) {
  if (!updatedTask || !updatedTask._id) return tasks;
  return tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task));
}

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await taskService.getTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar tarefas:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = useCallback(async (name) => {
    const newTask = await taskService.createTask(name);
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await taskService.deleteTask(id);
    setTasks((prev) => prev.filter((task) => task._id !== id));
  }, []);

  const updateTaskCompletion = useCallback(async (id, completed) => {
    const updated = await taskService.updateTask(id, completed);
    setTasks((prev) => (updated ? updateListWithTask(prev, updated) : prev));
    return updated;
  }, []);

  const addCard = useCallback(async (taskId, title) => {
    const updated = await taskService.addCard(taskId, title);
    setTasks((prev) => (updated ? updateListWithTask(prev, updated) : prev));
    if (!updated) await loadTasks();
    return updated;
  }, [loadTasks]);

  const updateCard = useCallback(async (taskId, cardIndex, done) => {
    const updated = await taskService.updateCard(taskId, cardIndex, done);
    setTasks((prev) => (updated ? updateListWithTask(prev, updated) : prev));
    if (!updated) await loadTasks();
    return updated;
  }, [loadTasks]);

  const deleteCard = useCallback(async (taskId, cardIndex) => {
    const updated = await taskService.deleteCard(taskId, cardIndex);
    setTasks((prev) => (updated ? updateListWithTask(prev, updated) : prev));
    if (!updated) await loadTasks();
    return updated;
  }, [loadTasks]);

  const addSession = useCallback(async (taskId, duration) => {
    await taskService.addSession(taskId, duration);
    await loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    loadTasks,
    createTask,
    deleteTask,
    updateTaskCompletion,
    addCard,
    updateCard,
    deleteCard,
    addSession,
  };
}

