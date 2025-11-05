import React, { useEffect, useMemo, useState } from "react";
import { progressService } from "../services/progressService";
import styles from "./ProgressPage.module.css";

const minutesToHhMm = (m) => {
  const minutes = Number(m) || 0;
  const h = Math.floor(minutes / 60);
  const mm = minutes % 60;
  return `${h}h ${mm}m`;
};

export default function ProgressPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    progressService
      .getProgress()
      .then(setData)
      .catch((e) => setError(e.message || "Erro ao carregar progresso"))
      .finally(() => setLoading(false));
  }, []);

  // Sempre definir estruturas com fallback para manter a ordem dos hooks
  const totals = data?.totals ?? {
    todayMinutes: 0,
    thisWeekMinutes: 0,
    thisMonthMinutes: 0,
    allTimeMinutes: 0,
  };
  const perTask = data?.perTask ?? [];
  const daily = data?.daily ?? [];
  const weekly = data?.weekly ?? [];
  const monthly = data?.monthly ?? [];

  // Para a barra de progresso por tarefa, normaliza pelo maior valor
  const maxTask = useMemo(
    () => Math.max(1, ...perTask.map((t) => Number(t.totalMinutes) || 0)),
    [perTask]
  );

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Progresso</h1>

      <section className={styles.totals}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Hoje</div>
          <div className={styles.cardValue}>{minutesToHhMm(totals.todayMinutes)}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Semana</div>
          <div className={styles.cardValue}>{minutesToHhMm(totals.thisWeekMinutes)}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Mês</div>
          <div className={styles.cardValue}>{minutesToHhMm(totals.thisMonthMinutes)}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Total</div>
          <div className={styles.cardValue}>{minutesToHhMm(totals.allTimeMinutes)}</div>
        </div>
      </section>

      <section className={styles.card}>
        <h2 style={{ marginTop: 0 }}>Por tarefa</h2>
        <div className={styles.taskList}>
          {perTask
            .slice()
            .sort((a, b) => b.totalMinutes - a.totalMinutes)
            .map((t) => {
              const pct = Math.round(((Number(t.totalMinutes) || 0) / maxTask) * 100);
              return (
                <div key={t.taskId}>
                  <div className={styles.taskItem}>
                    <div className={styles.taskName}>{t.name}</div>
                    <div>{minutesToHhMm(t.totalMinutes)}</div>
                  </div>
                  <div className={styles.meter}>
                    <div
                      className={styles.meterBar}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      <section className={styles.grids}>
        <div className={styles.list}>
          <h3>Diário (últimos 30)</h3>
          {daily
            .slice()
            .reverse()
            .slice(0, 15)
            .map((d) => (
              <div key={d.date} className={styles.row}>
                <span>{d.date}</span>
                <strong>{minutesToHhMm(d.minutes)}</strong>
              </div>
            ))}
        </div>
        <div className={styles.list}>
          <h3>Semanal (últimas 12)</h3>
          {weekly
            .slice()
            .reverse()
            .map((w) => (
              <div key={w.weekStart} className={styles.row}>
                <span>Semana de {w.weekStart}</span>
                <strong>{minutesToHhMm(w.minutes)}</strong>
              </div>
            ))}
        </div>
        <div className={styles.list}>
          <h3>Mensal (últimos 12)</h3>
          {monthly
            .slice()
            .reverse()
            .map((m) => (
              <div key={m.month} className={styles.row}>
                <span>{m.month}</span>
                <strong>{minutesToHhMm(m.minutes)}</strong>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
