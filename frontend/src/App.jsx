// import { useState, useEffect } from 'react'; -- AINDA NÃO USAMOS
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PomodoroPage from './pages/PomorodoPage';
import NotesPage from './pages/NotesPage';


function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pomodoro" element={<PomodoroPage />} />
            <Route path="/anotacoes" element={<NotesPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App
