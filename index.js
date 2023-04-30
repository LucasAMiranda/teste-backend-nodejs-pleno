const express = require('express');
const app = express();
const swaggerDocument = require('./swagger.json');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const port = 3000;
const baseURL = `http://localhost:${port}`;

app.listen(port, () => {
  console.log(`Server running on ${baseURL}`);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));