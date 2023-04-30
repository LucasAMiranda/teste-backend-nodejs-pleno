const moment = require('moment');
const axios = require('axios');
const db = require('./db');

class AnotacoesDAO extends db {
  constructor(connection) {
    this.connection = connection;
  }

  async inserirAnotacao(idPessoa, titulo, descricao, cep) {
    try {
      const endereco = await this.consultarCEP(cep);
      if (!endereco.cep) {
        throw new Error('CEP inválido');
      }
      const dataCadastro = moment().format('YYYY-MM-DD HH:mm:ss');
      const query = 'INSERT INTO anotacoes (id_pessoa, titulo, descricao, cep, endereco, data_cadastro) VALUES (?, ?, ?, ?, ?, ?)';
      const params = [idPessoa, titulo, descricao, cep, JSON.stringify(endereco), dataCadastro];
      const [result] = await this.connection.execute(query, params);
      return result.insertId;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async consultarAnotacoes() {
    try {
      const [rows] = await this.connection.execute('SELECT * FROM anotacoes');
      return rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async consultarCEP(cep) {
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    const response = await axios.get(url);
    return response.data;
  }
}

module.exports = AnotacoesDAO;
