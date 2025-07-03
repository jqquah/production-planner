const { Pool } = require('pg');

console.log('Initializing database connection pool...');

if (!process.env.DATABASE_URL) {
  console.error('FATAL ERROR: DATABASE_URL environment variable is not set.');
  process.exit(1); // Exit immediately if the database URL is missing
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('Database client connected successfully.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1); // Exit the process on a fatal database error
});

console.log('Database connection pool configured.');

module.exports = pool;
