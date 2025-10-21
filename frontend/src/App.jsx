import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import PomodoroPage from "./pages/PomorodoPage";
import NotesPage from "./pages/NotesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

function GuestOnlyRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? <Navigate to="/" /> : children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/pomodoro" element={<PomodoroPage />} />
              <Route path="/anotacoes" element={<NotesPage />} />
              <Route
                path="/login"
                element={
                  <GuestOnlyRoute>
                    <LoginPage />
                  </GuestOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestOnlyRoute>
                    <RegisterPage />
                  </GuestOnlyRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
