require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET is required in production. Set JWT_SECRET environment variable.');
}

module.exports = {
  JWT_SECRET: JWT_SECRET || 'dev_secret_do_not_use_in_production',
  JWT_EXPIRES
};