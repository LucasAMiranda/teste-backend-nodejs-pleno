const jwt = require('jsonwebtoken')
require('dotenv').config();

//Criando a proteção do token API
const secretKey = process.env.SECRET_KEY;


class AuthService {
  constructor() {
    this.secretKey = secretKey;
  }

  gerarToken(user) {
    const token = jwt.sign({ user }, this.secretKey);
    return token;
  }

  validarToken(token) {
    try {
      const decoded = jwt.verify(token, this.secretKey);
      return decoded.user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = AuthService;