const API_BASE_URL = "http://localhost:3001";

function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

function isLoggedIn() {
  return !!localStorage.getItem("token");
}

export const taskService = {
  async getTasks() {
    if (!isLoggedIn()) {
      // modo offline
      return JSON.parse(localStorage.getItem("localTasks") || "[]");
    }

    try {
      const res = await fetch(`${API_BASE_URL}/tasks`, { headers: getHeaders() });
      if (!res.ok) throw new Error("Erro ao buscar tarefas");
      const data = await res.json();
      localStorage.setItem("localTasks", JSON.stringify(data)); // sincroniza cache local
      return data;
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      return [];
    }
  },

  async createTask(name) {
    if (!isLoggedIn()) {
      const localTasks = JSON.parse(localStorage.getItem("localTasks") || "[]");
      const newTask = {
        _id: Date.now().toString(),
        name,
        completed: false,
        cards: [],
        local: true,
      };
      localStorage.setItem("localTasks", JSON.stringify([...localTasks, newTask]));
      return newTask;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Erro ao criar tarefa");
      return await res.json();
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      throw error;
    }
  },

  async updateTask(id, completed) {
    if (!isLoggedIn()) {
      const localTasks = JSON.parse(localStorage.getItem("localTasks") || "[]");
      const updated = localTasks.map(t => (t._id === id ? { ...t, completed } : t));
      localStorage.setItem("localTasks", JSON.stringify(updated));
      return updated.find(t => t._id === id);
    }

    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ completed }),
    });
    if (!res.ok) throw new Error("Erro ao atualizar tarefa");
    return await res.json();
  },

  async deleteTask(id) {
    if (!isLoggedIn()) {
      const localTasks = JSON.parse(localStorage.getItem("localTasks") || "[]");
      const updated = localTasks.filter(t => t._id !== id);
      localStorage.setItem("localTasks", JSON.stringify(updated));
      return { success: true };
    }

    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Erro ao deletar tarefa");
    return await res.json();
  },

  async addCard(taskId, title) {
    if (!isLoggedIn()) {
      const localTasks = JSON.parse(localStorage.getItem("localTasks") || "[]");
      const updated = localTasks.map(t =>
        t._id === taskId ? { ...t, cards: [...t.cards, { title, done: false }] } : t
      );
      localStorage.setItem("localTasks", JSON.stringify(updated));
      return updated.find(t => t._id === taskId);
    }

    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/cards`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Erro ao adicionar card");
    return await res.json();
  },

  async updateCard(taskId, cardIndex, done) {
    if (!isLoggedIn()) {
      const localTasks = JSON.parse(localStorage.getItem("localTasks") || "[]");
      const updated = localTasks.map(t => {
        if (t._id === taskId) {
          const cards = [...t.cards];
          if (cards[cardIndex]) cards[cardIndex].done = done;
          return { ...t, cards };
        }
        return t;
      });
      localStorage.setItem("localTasks", JSON.stringify(updated));
      return updated.find(t => t._id === taskId);
    }

    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/cards/${cardIndex}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ done }),
    });
    if (!res.ok) throw new Error("Erro ao atualizar card");
    return await res.json();
  },

  async deleteCard(taskId, cardIndex) {
    if (!isLoggedIn()) {
      const localTasks = JSON.parse(localStorage.getItem("localTasks") || "[]");
      const updated = localTasks.map(t => {
        if (t._id === taskId) {
          const cards = [...t.cards];
          cards.splice(cardIndex, 1);
          return { ...t, cards };
        }
        return t;
      });
      localStorage.setItem("localTasks", JSON.stringify(updated));
      return updated.find(t => t._id === taskId);
    }

    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/cards/${cardIndex}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Erro ao deletar card");
    return await res.json();
  },
};
