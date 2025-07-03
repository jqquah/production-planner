const express = require('express');
console.log('Backend service starting...');

// Check for essential environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}
console.log('JWT_SECRET found.');

const app = express();
const port = process.env.PORT || 5000;

console.log('Configuring middleware...');
// Middleware for parsing JSON bodies
app.use(express.json({ extended: false }));
console.log('Middleware configured.');

app.get('/', (req, res) => {
  res.send('Backend API is running.');
});

// Define Routes
console.log('Loading routes...');
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('Routes loaded successfully.');
} catch (err) {
  console.error('Error loading routes:', err);
  process.exit(1);
}

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
