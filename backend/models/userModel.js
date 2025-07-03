const pool = require('../db');
const bcrypt = require('bcryptjs');

/**
 * Finds a user by their email address.
 * @param {string} email - The email to search for.
 * @returns {Promise<object|undefined>} The user object if found, otherwise undefined.
 */
const findUserByEmail = async (email) => {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return rows[0];
};

/**
 * Finds a user by their username.
 * @param {string} username - The username to search for.
 * @returns {Promise<object|undefined>} The user object if found, otherwise undefined.
 */
const findUserByUsername = async (username) => {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return rows[0];
};

/**
 * Creates a new user in the database.
 * @param {string} username - The user's username.
 * @param {string} email - The user's email.
 * @param {string} password - The user's plaintext password.
 * @param {string} role - The user's role (e.g., 'admin').
 * @returns {Promise<object>} The newly created user object, excluding the password hash.
 */
const createUser = async (username, email, password) => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // The 'role' column is intentionally omitted to allow the database to apply its default value.
    const { rows } = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, role, created_at',
        [username, email, passwordHash]
    );
    return rows[0];
};

/**
 * Finds a user by their ID.
 * @param {string} id - The user's ID.
 * @returns {Promise<object|undefined>} The user object if found, otherwise undefined.
 */
const findUserById = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0];
};

module.exports = {
  findUserByEmail,
  findUserByUsername,
  createUser,
  findUserById,
};
