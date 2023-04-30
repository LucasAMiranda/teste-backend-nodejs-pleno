const moment = require('moment');
const db = require('./db');

class Pessoa {
  constructor({ nome, nome_mae, nome_pai = null, cep, data_nascimento }) {
    this.nome = nome;
    this.nome_mae = nome_mae;
    this.nome_pai = nome_pai;
    this.cep = cep;
    this.data_nascimento = moment(data_nascimento).format('YYYY-MM-DD');
    this.data_cadastro = moment().format('YYYY-MM-DD HH:mm:ss');
    this.data_edicao = moment().format('YYYY-MM-DD HH:mm:ss');
  }

  async salvar() {
    const sql = 'INSERT INTO pessoas SET ?';
    const values = {
      nome: this.nome,
      nome_mae: this.nome_mae,
      nome_pai: this.nome_pai,
      cep: this.cep,
      data_nascimento: this.data_nascimento,
      data_cadastro: this.data_cadastro,
      data_edicao: this.data_edicao,
    };
    const results = await db.query(sql, values);
    return results.insertId;
  }

  static async listar() {
    const sql = 'SELECT * FROM pessoas';
    const results = await db.query(sql);
    return results;
  }

  static async buscarPorId(id) {
    const sql = 'SELECT * FROM pessoas WHERE id = ?';
    const values = [id];
    const [results] = await db.query(sql, values);
    return results;
  }

  async atualizar(id) {
    const sql = 'UPDATE pessoas SET ? WHERE id = ?';
    const values = [
      {
        nome: this.nome,
        nome_mae: this.nome_mae,
        nome_pai: this.nome_pai,
        cep: this.cep,
        data_nascimento: this.data_nascimento,
        data_edicao: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
      id,
    ];
    const results = await db.query(sql, values);
    return results.affectedRows > 0;
  }

  static async excluir(id) {
    const sql = 'DELETE FROM pessoas WHERE id = ?';
    const values = [id];
    const results = await db.query(sql, values);
    return results.affectedRows > 0;
  }
}

module.exports = Pessoa;
