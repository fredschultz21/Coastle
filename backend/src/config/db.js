import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

console.log('DATABASE_URL loaded:', connectionString ? 'YES' : 'NO');

if (!connectionString) {
  console.error("ERROR: DATABASE_URL environment variable is not set!");
  process.exit(1);
}

export const pool = new Pool({
  connectionString: connectionString,
  family: 4, 
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.connect()
  .then(() => console.log("Connected to Supabase!"))
  .catch(err => console.error("DB connection error:", err));