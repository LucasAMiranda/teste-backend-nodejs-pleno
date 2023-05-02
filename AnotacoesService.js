const express = require('express');
const router = express.Router();
const axios = require('axios');
const moment = require('moment');
const { verifyToken } = require('./env');
require('dotenv').config();
const connection = require('./db');

// consultar CEP na API externa
async function consultarCEP(cep) {
  const url = `https://viacep.com.br/ws/${cep}/json/`;
  const response = await axios.get(url);
  return response.data;
}

// inserir uma nova anotação
router.post('/', verifyToken, async (req, res) => {
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
router.get('/', async (req, res) => {
  const [rows] = await connection.execute('SELECT * FROM anotacoes');
  res.json(rows);
});

// buscar anotações por pessoa
router.get('/pessoa/:id_pessoa', async (req, res) => {
  const id_pessoa = req.params.id_pessoa;
  const [rows] = await connection.execute('SELECT * FROM anotacoes WHERE id_pessoa = ?', [id_pessoa]);
  res.json(rows);
});

// atualizar uma anotação existente
router.put('/:id', verifyToken, async (req, res) => {
  const id = req.params.id;
  const { id_pessoa, titulo, descricao, cep } = req.body;
  try {
    const endereco = await consultarCEP(cep);
    if (!endereco.cep) {
      return res.status(400).json({ message: 'CEP inválido' });
    }
    const data_edicao = moment().format('YYYY-MM-DD HH:mm:ss');
    await connection.execute(
      'UPDATE anotacoes SET id_pessoa = ?, titulo = ?, descricao = ?, cep = ?, endereco = ?, data_edicao = ? WHERE id = ?',
      [id_pessoa, titulo, descricao, cep, JSON.stringify(endereco), data_edicao, id]
    );
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// deletar uma anotação existente
router.delete('/:id', verifyToken, async (req, res) => {
  const id = req.params.id;
  await connection.execute('DELETE FROM anotacoes WHERE id = ?', [id]);
  res.sendStatus(200);
});

module.exports = router;
