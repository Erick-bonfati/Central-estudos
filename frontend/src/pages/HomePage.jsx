// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

function HomePage() {
  return (
    <div className={styles.homepage}>
      <div className={styles.heroSection}>
        <h1>Central de Estudos</h1>
        <p>Organize seus estudos de forma eficiente e produtiva</p>
      </div>

      <div className={styles.featuresGrid}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🍅</div>
          <h3>Pomodoro Timer</h3>
          <p>Gerencie seu tempo de estudo com a técnica Pomodoro para máxima produtividade.</p>
          <Link to="/pomodoro" className="btn">Começar Timer</Link>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>📝</div>
          <h3>Anotações</h3>
          <p>Crie e organize suas anotações de estudo de forma simples e eficiente.</p>
          <Link to="/anotacoes" className="btn">Ver Anotações</Link>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>📊</div>
          <h3>Progresso</h3>
          <p>Acompanhe seu progresso e mantenha-se motivado nos seus estudos.</p>
          <button className="btn" disabled>Em Breve</button>
        </div>
      </div>

      <div className="card">
        <h2>Dicas para Estudar Melhor</h2>
        <ul className={styles.tipsList}>
          <li>Use a técnica Pomodoro: 25 minutos de foco + 5 minutos de pausa</li>
          <li>Faça anotações à mão para melhor retenção</li>
          <li>Estude em um ambiente silencioso e bem iluminado</li>
          <li>Revise o conteúdo em intervalos regulares</li>
        </ul>
      </div>
    </div>
  );
}

export default HomePage;