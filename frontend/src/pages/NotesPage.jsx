import React, { useMemo, useState } from "react";
import styles from "./NotesPage.module.css";
import { useTasks } from "../hooks/useTasks";

function NotesPage() {
  const {
    tasks,
    createTask,
    deleteTask,
    addCard,
    deleteCard,
    updateCard,
    updateTaskCompletion,
  } = useTasks();

  const [showForm, setShowForm] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");

  const visibleNotes = useMemo(
    () => tasks.filter((note) => !hideCompleted || !note.completed),
    [tasks, hideCompleted]
  );

  const handleAddNote = async () => {
    const title = newNoteTitle.trim();
    if (!title) return;
    try {
      await createTask(title);
      setNewNoteTitle("");
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao criar anotação:", error);
      alert("Erro ao criar anotação. Tente novamente.");
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteTask(id);
    } catch (error) {
      console.error("Erro ao deletar anotação:", error);
    }
  };

  const handleAddCard = async (taskId, cardTitle) => {
    const title = cardTitle.trim();
    if (!title) return;
    try {
      await addCard(taskId, title);
    } catch (error) {
      console.error("Erro ao adicionar card:", error);
    }
  };

  const handleDeleteCard = async (taskId, cardIndex) => {
    try {
      await deleteCard(taskId, cardIndex);
    } catch (error) {
      console.error("Erro ao deletar card:", error);
    }
  };

  const handleToggleCard = async (taskId, cardIndex, done) => {
    try {
      await updateCard(taskId, cardIndex, done);
    } catch (error) {
      console.error("Erro ao atualizar card:", error);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await updateTaskCompletion(taskId, true);
    } catch (error) {
      console.error("Erro ao concluir tarefa:", error);
    }
  };

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
            onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
          />
          <button className="btn" onClick={handleAddNote}>
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
                    onClick={() => handleDeleteNote(note._id)}
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
                          handleToggleCard(note._id, index, !card.done)
                        }
                      />
                      <span className={card.done ? styles.cardDone : ""}>
                        {card.title}
                      </span>
                    </div>

                    <div className={styles.cardButtons}>
                      <button
                        className={styles.deleteCardBtn}
                        onClick={() => handleDeleteCard(note._id, index)}
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
                          await handleAddCard(note._id, e.target.value);
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
                    onClick={() => handleCompleteTask(note._id)}
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
