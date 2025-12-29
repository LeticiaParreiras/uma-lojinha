// Define ambiente de teste
process.env.NODE_ENV = 'test';

// Carrega variáveis do .env.test
require('dotenv').config({ path: '.env.test' });

// Importa crypto globalmente para compatibilidade com Node.js 18+
import crypto from 'crypto';
Object.defineProperty(global, 'crypto', { value: crypto });