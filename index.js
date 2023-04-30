const mysql = require('mysql');
const express = require('express');
const app = express();
const axios = require('axios');
const moment = require('moment');
const swaggerDocument = require('./swagger.json');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken')
require('dotenv').config();

const port = 3000;
const baseURL = `http://localhost:${port}`;

app.listen(port, () => {
  console.log(`Server running on ${baseURL}`);
});

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
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


//Criando a proteção do token API
const secretKey = process.env.SECRET_KEY;
const token = jwt.sign({ user: 'admin' }, secretKey);

// validar o token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send('Token não fornecido');
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).send('Token inválido');
    }
    req.user = decoded.user;
    next();
  });
}

//Modelo Pessoas

// inserir uma nova pessoa
app.post('/pessoas', verifyToken, (req, res) => {
  const pessoa = req.body;
  const data_cadastro = moment().format('YYYY-MM-DD HH:mm:ss');
  pessoa.data_cadastro = data_cadastro;
  connection.query('INSERT INTO pessoas SET ?', pessoa, (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

// atualizar uma pessoa existente
app.put('/pessoas/:id', verifyToken, (req, res) => {
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
app.delete('/pessoas/:id', verifyToken, (req, res) => {
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
app.post('/anotacoes', verifyToken, async (req, res) => {
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