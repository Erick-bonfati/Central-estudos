// src/pages/NotesPage.jsx
import React, { useState } from 'react';
import styles from './NotesPage.module.css';

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [showForm, setShowForm] = useState(false);

  const addNote = () => {
    if (newNote.title && newNote.content) {
      setNotes([...notes, { ...newNote, id: Date.now() }]);
      setNewNote({ title: '', content: '' });
      setShowForm(false);
    }
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className={styles.notesPage}>
      <div className={styles.notesHeader}>
        <h1>Minhas Anotações</h1>
        <button 
          className="btn" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : '+ Nova Anotação'}
        </button>
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
        {notes.map(note => (
          <div key={note.id} className={styles.noteCard}>
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

      {notes.length === 0 && (
        <div className="card empty-state">
          <div className={styles.emptyIcon}>📝</div>
          <h3>Nenhuma anotação ainda</h3>
          <p>Crie sua primeira anotação clicando no botão acima!</p>
        </div>
      )}
    </div>
  );
}

export default NotesPage;