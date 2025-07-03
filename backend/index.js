console.log('[INIT] Backend service starting...');

console.log('[INIT] Configuring environment variables...');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
console.log('[INIT] Environment variables configured.');

console.log('[INIT] Checking for essential environment variables...');
if (!process.env.JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET is not defined.');
  process.exit(1);
}
console.log('[SUCCESS] JWT_SECRET found.');

console.log('[INIT] Initializing database connection...');
require('./db'); // Ensures the database pool is initialized
console.log('[SUCCESS] Database module loaded.');

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

console.log(`[INIT] Starting server setup on port ${port}...`);

console.log('[INIT] Configuring middleware...');
app.use(cors({ origin: 'http://localhost:3000' })); // Allow requests from frontend
app.use(express.json({ extended: false }));
console.log('[SUCCESS] Middleware configured.');

app.get('/', (req, res) => {
  res.send('Backend API is running.');
});

console.log('[INIT] Loading routes...');
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/recipes', require('./routes/recipes'));
  app.use('/api/materials', require('./routes/materials'));
  app.use('/api/production', require('./routes/production'));
  console.log('[SUCCESS] Routes loaded successfully.');
} catch (err) {
  console.error('[FATAL] Error loading routes:', err);
  process.exit(1);
}

app.listen(port, () => {
  console.log(`[SUCCESS] Backend server listening on port ${port}`);
});

console.log('[INIT] Server setup complete. Waiting for connections...');
