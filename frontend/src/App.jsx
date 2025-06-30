import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  // 1. Criando um "estado" para guardar a mensagem que virá do backend
  const [message, setMessage] = useState('');

  // 2. useEffect é um gancho do React. O código aqui dentro roda depois que o componente é montado na tela. Perfeito para buscar dados.
  useEffect(() => {
    // 3. Usando a função 'fetch' do navegador para chamar nossa API do backend
    fetch('http://localhost:3001/')
      .then((res) => res.json()) // Converter a resposta para JSON
      .then((data) => setMessage(data.message)) // Pega a mensagem e guarda no nosso "estado" acima.
      .catch((err) => console.error('Falha ao buscar dados:', err)) // Lida com erros
  }, []); // O array vazio "[]" significa: "rode este efeito apenas uma vez"

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        {/* 4. Exibimos a mensagem que está no nosso estado. */}
        <h2>Mensagem do Backend: "{message}"</h2>

        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
