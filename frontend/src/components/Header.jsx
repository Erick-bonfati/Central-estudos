// src/components/Header.jsx
import React, { useState } from 'react';
// Importamos o "Link" e "NavLink" do React Router para navegação
import { Link, NavLink } from 'react-router-dom'; 
// Importamos nossos estilos
import styles from './Header.module.css';

function Header() {
  // Estado para controlar se o menu mobile está aberto ou fechado
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">Central de Estudos</Link>
      </div>

      {/* Navegação para telas grandes */}
      <nav className={styles.navLinks}>
        {/* NavLink tem a vantagem de saber se o link está "ativo" */}
        <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''}>Início</NavLink>
        <NavLink to="/pomodoro" className={({ isActive }) => isActive ? styles.active : ''}>Pomodoro</NavLink>
        <NavLink to="/anotacoes" className={({ isActive }) => isActive ? styles.active : ''}>Anotações</NavLink>
      </nav>

      {/* Menu Hambúrguer para telas pequenas */}
      <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
        <div />
        <div />
        <div />
      </button>

      {/* Navegação para telas pequenas (só aparece quando o menu está aberto) */}
      {menuOpen && (
        <nav className={`${styles.mobileNavLinks} ${menuOpen ? styles.open : ''}`}>
          <button 
            className={styles.closeBtn}
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          >
            ×
          </button>
          <Link to="/" onClick={() => setMenuOpen(false)}>Início</Link>
          <Link to="/pomodoro" onClick={() => setMenuOpen(false)}>Pomodoro</Link>
          <Link to="/anotacoes" onClick={() => setMenuOpen(false)}>Anotações</Link>
        </nav>
      )}
    </header>
  );
}

export default Header;