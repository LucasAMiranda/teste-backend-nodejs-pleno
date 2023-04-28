//Testando minha aplicação

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

  