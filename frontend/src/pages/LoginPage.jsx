import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import styles from "./LoginPage.module.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await authService.login(email, password);
      login(data);
      navigate("/");
    } catch {
      setError("Email ou senha incorretos");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Entrar na sua conta</h2>
        <p className={styles.subtitle}>Bem-vindo de volta 👋</p>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleLogin} className={styles.form}>
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
            Entrar
          </button>
        </form>

        <p className={styles.switchText}>
          Ainda não tem uma conta?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className={styles.linkButton}
          >
            Cadastre-se
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
