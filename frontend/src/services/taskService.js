// Serviço para gerenciar tarefas via API
const API_BASE_URL = 'http://localhost:3001';

export const taskService = {
  // Buscar todas as tarefas
  async getTasks() {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`);
      if (!response.ok) throw new Error('Erro ao buscar tarefas');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      return [];
    }
  },

  // Criar nova tarefa
  async createTask(name) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Erro ao criar tarefa');
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  },

  // Atualizar tarefa (marcar como completa)
  async updateTask(id, completed) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });
      if (!response.ok) throw new Error('Erro ao atualizar tarefa');
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  },

  // Deletar tarefa
  async deleteTask(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao deletar tarefa');
      return await response.json();
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      throw error;
    }
  }
};
