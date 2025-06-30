
// Importando o framework express
const express = require('express'); 
// Importando pacote cors - proteção de solitações de outras urls
const cors = require('cors')


// Criando uma instancia do  express para nosso app
const app = express();

// Aplicao middleware do cors - verifcação entre cliente e resposta do servidor
app.use(cors());

// Definindo porta
const PORT = 3001;

// Criando uma rota para o path "/" - get = busca dados
app.get("/", (req, res) => {
  //Enviando resposta no formato JSON pois é o formato padrão da APIs
  res.json({message: 'Olá, recebi os dados da API'})
});

// Inicia servidor e faz ele escutar na porta definida
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta http://localhost:${PORT}`)
});

//RODAR BACKEND - node server.js
