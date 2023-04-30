const mysql = require('mysql');
const express = require('express');
const app = express();
const axios = require('axios');
const moment = require('moment');
const swaggerDocument = require('./swagger.json');
const swaggerUi = require('swagger-ui-express');


const port = 3000;
const baseURL = `http://localhost:${port}`;

app.listen(port, () => {
  console.log(`Server running on ${baseURL}`);
});

const connection = mysql.createConnection({
    host: 'localhost', // nome do host,
    user: 'root',
    password: '',
    database: 'backend',
    port: '3306',
});


connection.connect((error) => {
  if (error) {
    console.error('Error connecting to database:', error);
    return;
  }
  console.log('Connected to database');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());

//Modelo Pessoas

// inserir uma nova pessoa
app.post('/pessoas', (req, res) => {
  const pessoa = req.body;
  const data_cadastro = moment().format('YYYY-MM-DD HH:mm:ss');
  pessoa.data_cadastro = data_cadastro;
  connection.query('INSERT INTO pessoas SET ?', pessoa, (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

// atualizar uma pessoa existente
app.put('/pessoas/:id', (req, res) => {
  const id = req.params.id;
  const pessoa = req.body;
  const data_edicao = moment().format('YYYY-MM-DD HH:mm:ss');
  pessoa.data_edicao = data_edicao;
  connection.query('UPDATE pessoas SET ? WHERE id = ?', [pessoa, id], (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

// listar todas as pessoas
app.get('/pessoas', (req, res) => {
  connection.query('SELECT * FROM pessoas', (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

// deletar uma pessoa existente
app.delete('/pessoas/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM pessoas WHERE id = ?', id, (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

//Modelo Anotações

// consultar CEP na API externa
async function consultarCEP(cep) {
  const url = `https://viacep.com.br/ws/${cep}/json/`;
  const response = await axios.get(url);
  return response.data;
}

// inserir uma nova anotação
app.post('/anotacoes', async (req, res) => {
  const { id_pessoa, titulo, descricao, cep } = req.body;
  try {
    const endereco = await consultarCEP(cep);
    if (!endereco.cep) {
      return res.status(400).json({ message: 'CEP inválido' });
    }
    const data_cadastro = moment().format('YYYY-MM-DD HH:mm:ss');
    await connection.execute(
      'INSERT INTO anotacoes (id_pessoa, titulo, descricao, cep, endereco, data_cadastro) VALUES (?, ?, ?, ?, ?, ?)',
      [id_pessoa, titulo, descricao, cep, JSON.stringify(endereco), data_cadastro]
    );
    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// listar todas as anotações
app.get('/anotacoes', async (req, res) => {
  const [rows] = await connection.execute('SELECT * FROM anotacoes');
  res.json(rows);
});