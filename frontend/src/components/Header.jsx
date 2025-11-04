import React, { useState, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { AuthContext } from "../context/AuthContext";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">Central de Estudos</Link>
      </div>

      <nav className={styles.navLinks}>
        <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : "")}>
          Início
        </NavLink>
        <NavLink to="/pomodoro" className={({ isActive }) => (isActive ? styles.active : "")}>
          Pomodoro
        </NavLink>
        <NavLink to="/anotacoes" className={({ isActive }) => (isActive ? styles.active : "")}>
          Anotações
        </NavLink>

        {!user ? (
          <>
            <NavLink to="/login" className={({ isActive }) => (isActive ? styles.active : "")}>
              Login
            </NavLink>
          </>
        ) : (
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Sair
          </button>
        )}
      </nav>

      {/* Menu mobile */}
      <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
        <div />
        <div />
        <div />
      </button>

      {menuOpen && (
        <nav className={`${styles.mobileNavLinks} ${menuOpen ? styles.open : ""}`}>
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

          {!user ? (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Registrar-se</Link>
            </>
          ) : (
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Sair
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

export default Header;
