import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import styles from "./RegisterPage.module.css";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await authService.register(name, email, password);
      navigate("/login");
    } catch {
      setError("Erro ao registrar. Tente outro email.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Criar nova conta</h2>
        <p className={styles.subtitle}>Junte-se à Central de Estudos 🚀</p>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleRegister} className={styles.form}>
          <input
            type="text"
            placeholder="Seu nome"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className={styles.button}>
            Registrar
          </button>
        </form>

        <p className={styles.switchText}>
          Já tem uma conta?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className={styles.linkButton}
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
