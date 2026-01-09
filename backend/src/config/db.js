import { Pool } from "pg";

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'LOADED' : 'UNDEFINED');
console.log('First 20 chars:', process.env.DATABASE_URL?.substring(0, 20));

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
  min: 2,
  query_timeout: 10000, 
  statement_timeout: 10000,
  keepAlive: true, 
  keepAliveInitialDelayMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Pool error:', err);
});

pool.on('connect', () => {
  console.log('✓ Database connected');
});

pool.on('remove', () => {
  console.log('- Connection removed from pool');
});