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
  // Connection pool settings to prevent exhaustion
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Timeout if connection takes too long
});

// Handle pool-level errors to prevent crashes
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client:', err);
  // Don't exit - the pool will handle reconnection
});

// Test connection on startup WITHOUT holding a client
pool.query('SELECT NOW()')
  .then(() => console.log("Connected to Supabase!"))
  .catch(err => console.error("DB connection error:", err));

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database pool...');
  await pool.end();
  process.exit(0);
});