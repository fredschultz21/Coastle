import { Pool } from "pg";
import dotenv from 'dotenv';
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Pool error:', err);
});