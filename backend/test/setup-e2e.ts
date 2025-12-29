// Define ambiente de teste
process.env.NODE_ENV = 'test';

// Carrega variáveis do .env.test
require('dotenv').config({ path: '.env.test' });