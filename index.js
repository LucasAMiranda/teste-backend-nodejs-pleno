const mysql = require('mysql');
const express = require('express');
const app = express();
const axios = require('axios');
const moment = require('moment');
const swaggerDocument = require('./swagger.json');

const port = 3000;
const baseURL = `http://localhost:${port}`;

const connection = mysql.createConnection({
  host: 'localhost',
  user: '',
  password: '',
  database: 'backend'
});

connection.connect();


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

//Testando minha aplicação 
const axios = require('axios');
const moment = require('moment');



describe('Testes para os endpoints', () => {

  test('Deve inserir uma nova pessoa', async () => {
    const pessoa = {
      nome: 'Lucas',
      idade: 30,
      email: 'lucas@teste.com',
      cep: '1234-567',
    };
    const response = await axios.post(`${baseURL}/pessoas`, pessoa);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });

  test('Deve atualizar uma pessoa existente', async () => {
    const pessoa = {
      nome: 'Tayse',
      idade: 43,
      email: 'tayse@teste.com',
      cep: '1234-5678',
    };
    const responseInsert = await axios.post(`${baseURL}/pessoas`, pessoa);
    const id = responseInsert.data.insertId;
    pessoa.nome = 'Fulano da Silva';
    const responseUpdate = await axios.put(`${baseURL}/pessoas/${id}`, pessoa);
    expect(responseUpdate.status).toBe(200);
    expect(responseUpdate.data).toBeDefined();
  });

  test('Deve listar todas as pessoas', async () => {
    const response = await axios.get(`${baseURL}/pessoas`);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });

  test('Deve deletar uma pessoa existente', async () => {
    const pessoa = {
      nome: 'Cida',
      idade: 61,
      email: 'cida@teste.com',
      cep: '1234-56789',
    };
    const responseInsert = await axios.post(`${baseURL}/pessoas`, pessoa);
    const id = responseInsert.data.insertId;
    const responseDelete = await axios.delete(`${baseURL}/pessoas/${id}`);
    expect(responseDelete.status).toBe(200);
    expect(responseDelete.data).toBeDefined();
  });

  test('Deve inserir uma nova anotação', async () => {
    const anotacao = {
      id_pessoa: 1,
      titulo: 'Teste de anotação',
      descricao: 'Descrição da anotação',
      data_cadastro: moment().format('YYYY-MM-DD HH:mm:ss'),
      data_edicao: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    const response = await axios.post(`${baseURL}/anotacoes`, anotacao);
    expect(response.status).toBe(201);
  });

  test('Deve listar todas as anotações', async () => {
    const response = await axios.get(`${baseURL}/anotacoes`);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });
});

// Configuração do Swagger UI...
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
