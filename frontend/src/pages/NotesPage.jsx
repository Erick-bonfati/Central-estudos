// src/pages/NotesPage.jsx
import React, { useState, useEffect } from 'react';
import styles from './NotesPage.module.css';
import { taskService } from '../services/taskService';

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [showForm, setShowForm] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);

  // Carregar anotações (que são as tarefas) quando o componente monta
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const tasksData = await taskService.getTasks();
      // Converter tarefas em anotações
      const notesData = tasksData.map(task => ({
        id: task.id,
        title: task.name,
        content: task.completed ? '✅ Concluída' : '⏳ Em andamento',
        completed: task.completed,
        createdAt: task.createdAt
      }));
      setNotes(notesData);
    } catch (error) {
      console.error('Erro ao carregar anotações:', error);
    }
  };

  const addNote = async () => {
    if (newNote.title && newNote.content) {
      try {
        // Criar tarefa na API
        const newTask = await taskService.createTask(newNote.title);
        // Atualizar lista local
        const newNoteData = {
          id: newTask.id,
          title: newTask.name,
          content: '⏳ Em andamento',
          completed: false,
          createdAt: newTask.createdAt
        };
        setNotes([...notes, newNoteData]);
        setNewNote({ title: '', content: '' });
        setShowForm(false);
      } catch (error) {
        console.error('Erro ao criar anotação:', error);
        alert('Erro ao criar anotação. Tente novamente.');
      }
    }
  };

  const deleteNote = async (id) => {
    try {
      await taskService.deleteTask(id);
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Erro ao deletar anotação:', error);
      alert('Erro ao deletar anotação. Tente novamente.');
    }
  };


  return (
    <div className={styles.notesPage}>
      <div className={styles.notesHeader}>
        <h1>Minhas Anotações</h1>
        <div className={styles.headerButtons}>
          <button 
            className="btn" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : '+ Nova Anotação'}
          </button>
          <button 
            className={`btn ${hideCompleted ? 'secondary' : ''}`}
            onClick={() => setHideCompleted(!hideCompleted)}
          >
            {hideCompleted ? 'Mostrar Concluídas' : 'Ocultar Concluídas'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card note-form">
          <h3>Nova Anotação</h3>
          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Título da anotação"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <textarea
              placeholder="Conteúdo da anotação"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className={styles.formTextarea}
              rows="4"
            />
          </div>
          <button className="btn" onClick={addNote}>
            Salvar Anotação
          </button>
        </div>
      )}

      <div className={styles.notesGrid}>
        {notes
          .filter(note => !hideCompleted || !note.completed)
          .map(note => (
          <div key={note.id} className={`${styles.noteCard} ${note.completed ? styles.completed : ''}`}>
            <div className={styles.noteHeader}>
              <h3>{note.title}</h3>
              <button 
                className={styles.deleteBtn}
                onClick={() => deleteNote(note.id)}
                title="Excluir anotação"
              >
                ×
              </button>
            </div>
            <p>{note.content}</p>
            <div className={styles.noteDate}>
              Criada em: {new Date(note.id).toLocaleDateString('pt-BR')}
            </div>
          </div>
        ))}
      </div>

      {notes.filter(note => !hideCompleted || !note.completed).length === 0 && (
        <div className="card empty-state">
          <div className={styles.emptyIcon}>📝</div>
          <h3>
            {hideCompleted ? 'Nenhuma tarefa pendente' : 'Nenhuma anotação ainda'}
          </h3>
          <p>
            {hideCompleted 
              ? 'Todas as tarefas foram concluídas! 🎉' 
              : 'Crie sua primeira anotação clicando no botão acima! Ela aparecerá automaticamente no Timer Pomodoro.'
            }
          </p>
        </div>
      )}
    </div>
  );
}

export default NotesPage;