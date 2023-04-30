const axios = require('axios');
const moment = require('moment');
const db = require('./db');

class Anotacao {
    constructor({ id_pessoa, titulo, descricao, cep }) {
        this.id_pessoa = id_pessoa;
        this.titulo = titulo;
        this.descricao = descricao;
        this.cep = cep;
    }

    async salvar() {
        const endereco = await this.buscarEnderecoPorCep();
        const dataCriacao = moment().format('YYYY-MM-DD HH:mm:ss');
        const anotacao = {
        id_pessoa: this.id_pessoa,
        titulo: this.titulo,
        descricao: this.descricao,
        endereco: endereco,
        data_criacao: dataCriacao,
    };
    const [result] = await db('anotacoes').insert(anotacao).returning('*');
    return result;
    }

    async buscarEnderecoPorCep() {
        const { data } = await axios.get(`https://viacep.com.br/ws/${this.cep}/json/`);
        const { logradouro, bairro, localidade, uf } = data;
        return {logradouro}, {bairro}, {localidade} - {uf};
    }
}

module.exports = Anotacao;