const request = require('supertest');
const express = require('express');

// Create a new express app for testing
const app = express();
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

describe('GET /', () => {
  it('should respond with Backend is running!', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Backend is running!');
  });
});
