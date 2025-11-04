import React, { useState, useEffect } from "react";
import styles from "./NotesPage.module.css";
import { taskService } from "../services/taskService";

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const tasksData = await taskService.getTasks();
      setNotes(tasksData);
    } catch (error) {
      console.error("Erro ao carregar anotações:", error);
    }
  };

  const addNote = async () => {
    if (!newNoteTitle.trim()) return;
    try {
      const newTask = await taskService.createTask(newNoteTitle.trim());
      setNotes([...notes, newTask]);
      setNewNoteTitle("");
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao criar anotação:", error);
      alert("Erro ao criar anotação. Tente novamente.");
    }
  };

  const deleteNote = async (id) => {
    try {
      await taskService.deleteTask(id);
      setNotes(notes.filter((note) => note._id !== id));
    } catch (error) {
      console.error("Erro ao deletar anotação:", error);
    }
  };

  const addCard = async (taskId, cardTitle) => {
    if (!cardTitle.trim()) return;
    try {
      await taskService.addCard(taskId, cardTitle.trim());
      await loadNotes();
    } catch (error) {
      console.error("Erro ao adicionar card:", error);
    }
  };

  const deleteCard = async (taskId, cardIndex) => {
    try {
      await taskService.deleteCard(taskId, cardIndex)
      await loadNotes()
    } catch (error) {
      console.error('Erro ao deletar card:', error)
    }
  }

  const toggleCardDone = async (taskId, cardIndex, done) => {
    try {
      await taskService.updateCard(taskId, cardIndex, done);
      await loadNotes();
    } catch (error) {
      console.error("Erro ao atualizar card:", error);
    }
  };

  const completeTask = async (taskId) => {
    try {
      await taskService.updateTask(taskId, true);
      await loadNotes();
    } catch (error) {
      console.error("Erro ao concluir tarefa:", error);
    }
  };

  const visibleNotes = notes.filter((n) => !hideCompleted || !n.completed);

  return (
    <div className={styles.notesPage}>
      <div className={styles.notesHeader}>
        <h1>Minhas Anotações</h1>
        <div className={styles.headerButtons}>
          <button className="btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancelar" : "+ Nova Anotação"}
          </button>
          <button
            className={`btn ${hideCompleted ? "secondary" : ""}`}
            onClick={() => setHideCompleted(!hideCompleted)}
          >
            {hideCompleted ? "Mostrar Concluídas" : "Ocultar Concluídas"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card note-form">
          <h3>Nova Anotação</h3>
          <input
            type="text"
            placeholder="Título da anotação"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            className={styles.formInput}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
          />
          <button className="btn" onClick={addNote}>
            Salvar
          </button>
        </div>
      )}

      <div className={styles.notesGrid}>
        {visibleNotes.map((note) => {
          const total = note.cards?.length || 0;
          const doneCount = note.cards?.filter((c) => c.done).length || 0;
          const canComplete = total === 0 || doneCount === total;

          return (
            <div
              key={note._id}
              className={`${styles.noteCard} ${
                note.completed ? styles.completed : ""
              }`}
            >
              <div className={styles.noteHeader}>
                <h3>{note.name}</h3>
                <div className={styles.noteActions}>
                  {note.completed && (
                    <span className={styles.badge}>Concluída</span>
                  )}
                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteNote(note._id)}
                  >
                    ×
                  </button>
                </div>
              </div>

              <ul className={styles.cardsList}>
                {(note.cards || []).map((card, index) => (
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
                          toggleCardDone(note._id, index, !card.done)
                        }
                      />
                      <span className={card.done ? styles.cardDone : ""}>
                        {card.title}
                      </span>
                    </div>

                    <div className={styles.cardButtons}>
                      <button
                        className={styles.deleteCardBtn}
                        onClick={() => deleteCard(note._id, index)}
                        title="Excluir card"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className={styles.addCard}>
                <input
                  type="text"
                  placeholder="Adicionar item..."
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && e.target.value.trim()) {
                      await addCard(note._id, e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className={styles.cardInput}
                />
              </div>

              <div className={styles.noteFooter}>
                <div className={styles.progressText}>
                  {total > 0 ? `${doneCount}/${total} itens` : "Sem itens"}
                </div>
                {canComplete && !note.completed && (
                  <button
                    className="btn"
                    onClick={() => completeTask(note._id)}
                  >
                    Concluir tarefa
                  </button>
                )}
                <div className={styles.noteDate}>
                  Criada em:{" "}
                  {note.createdAt
                    ? new Date(note.createdAt).toLocaleDateString("pt-BR")
                    : "-"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visibleNotes.length === 0 && (
        <div className="card empty-state">
          <div className={styles.emptyIcon}>📝</div>
          <h3>
            {hideCompleted
              ? "Nenhuma tarefa pendente"
              : "Nenhuma anotação ainda"}
          </h3>
          <p>
            {hideCompleted
              ? "Todas as tarefas foram concluídas! 🎉"
              : "Crie sua primeira anotação e adicione cards dentro dela."}
          </p>
        </div>
      )}
    </div>
  );
}

export default NotesPage;
