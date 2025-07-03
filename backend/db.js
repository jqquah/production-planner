const { Pool } = require('pg');

console.log('Initializing database connection pool...');

let connectionString = process.env.DATABASE_URL;

// If DATABASE_URL is not provided, try to construct it from individual parts
if (!connectionString) {
  console.log('DATABASE_URL not found, trying to construct from components...');
  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, DB_HOST, DB_PORT } = process.env;

  if (POSTGRES_USER && POSTGRES_PASSWORD && POSTGRES_DB) {
    const host = DB_HOST || 'localhost';
    const port = DB_PORT || 5432;
    connectionString = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${host}:${port}/${POSTGRES_DB}`;
    console.log('Constructed DATABASE_URL from components.');
  } else {
    console.error('FATAL ERROR: Database connection variables (DATABASE_URL or POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB) are not set.');
    process.exit(1);
  }
}

const pool = new Pool({
  connectionString,
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
