const request = require('supertest');
const express = require('express');
const app = express();
const connection = require('./db');
require('dotenv').config();

const port = 3000;
const baseURL = `http://localhost:${port}`;

app.listen(port, () => {
  console.log(`Server running on ${baseURL}`);
});


const secretKey = process.env.SECRET_KEY;

describe('Testes das Rotas', () => {
  let token = secretKey;

  beforeAll(async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'usuario@teste.com',
        senha: 'senha123'
      });
    token = response.body.token;
  });

  describe('POST /anotacoes', () => {
    it('deve retornar 201 para uma nova anotação válida', async () => {
      const response = await request(app)
        .post('/anotacoes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          id_pessoa: 1,
          titulo: 'Título da Anotação',
          descricao: 'Descrição da Anotação',
          cep: '12345-678'
        });
      expect(response.statusCode).toEqual(201);
    });

    it('deve retornar 400 para um CEP inválido', async () => {
      const response = await request(app)
        .post('/anotacoes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          id_pessoa: 1,
          titulo: 'Título da Anotação',
          descricao: 'Descrição da Anotação',
          cep: '00000-000'
        });
      expect(response.statusCode).toEqual(400);
      expect(response.body.message).toEqual('CEP inválido');
    });
  });

  describe('GET /anotacoes', () => {
    it('deve retornar uma lista vazia de anotações', async () => {
      const response = await request(app).get('/anotacoes');
      expect(response.statusCode).toEqual(200);
      expect(response.body.length).toEqual(0);
    });
  });

  describe('GET /anotacoes/pessoa/:id_pessoa', () => {
    it('deve retornar uma lista vazia de anotações para uma pessoa sem anotações', async () => {
      const response = await request(app).get('/anotacoes/pessoa/1');
      expect(response.statusCode).toEqual(200);
      expect(response.body.length).toEqual(0);
    });
  });

  describe('PUT /anotacoes/:id', () => {
    let anotacaoId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/anotacoes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          id_pessoa: 1,
          titulo: 'Título da Anotação',
          descricao: 'Descrição da Anotação',
          cep: '12345-678'
        });
      anotacaoId = response.body.insertId;
    });

    it('deve atualizar uma anotação ', async () => {
      const response = await request(app)
      .put(`/anotacoes/${anotacaoId}`)
      .set(`Authorization', Bearer ${token}`)
      .send({
      id_pessoa: 2,
      titulo: 'Novo Título',
      descricao: 'Nova Descrição',
      cep: '87654-321'
      });
      expect(response.status).toBe(200);

      const [rows] = await connection.execute('SELECT * FROM anotacoes WHERE id = ?', [anotacaoId]);
      const anotacaoAtualizada = rows[0];
    
      expect(anotacaoAtualizada.id_pessoa).toBe(2);
      expect(anotacaoAtualizada.titulo).toBe('Novo Título');
      expect(anotacaoAtualizada.descricao).toBe('Nova Descrição');
      expect(anotacaoAtualizada.cep).toBe('87654-321');
      expect(anotacaoAtualizada.endereco).toBeTruthy();
      expect(anotacaoAtualizada.data_edicao).toBeTruthy();
    });
    });

    describe('DELETE /anotacoes/:id', () => {
      let anotacaoId;
      
     
      beforeAll(async () => {
        const response = await request(app)
          .post('/anotacoes')
          .set('Authorization', `Bearer ${token}`)
          .send({
            id_pessoa: 1,
            titulo: 'Título da Anotação',
            descricao: 'Descrição da Anotação',
            cep: '12345-678'
          });
        anotacaoId = response.body.insertId;
      });
      
      it('deve deletar uma anotação', async () => {
        const response = await request(app)
          .delete(`/anotacoes/${anotacaoId}`)
          .set('Authorization', `Bearer ${token}`);
      
        expect(response.status).toBe(200);
      
        const [rows] = await connection.execute('SELECT * FROM anotacoes WHERE id = ?', [anotacaoId]);
        expect(rows.length).toBe(0);
      });
      });
    });