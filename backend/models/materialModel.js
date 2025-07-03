const pool = require('../db');

/**
 * Retrieves all materials from the database.
 * @returns {Promise<Array<object>>} A list of all materials.
 */
const getAllMaterials = async () => {
    const { rows } = await pool.query('SELECT * FROM materials ORDER BY name ASC');
    return rows;
};

/**
 * Retrieves a single material by its ID, including its batches.
 * @param {number} id - The ID of the material to retrieve.
 * @returns {Promise<object|null>} The material object with batches, or null if not found.
 */
const getMaterialById = async (id) => {
    const materialResult = await pool.query('SELECT * FROM materials WHERE id = $1', [id]);

    if (materialResult.rows.length === 0) {
        return null;
    }

    const batchesResult = await pool.query(
        'SELECT * FROM material_batches WHERE material_id = $1 ORDER BY received_date DESC',
        [id]
    );

    const material = materialResult.rows[0];
    material.batches = batchesResult.rows;

    return material;
};

/**
 * Creates a new material in the database.
 * @param {object} materialData - The data for the new material.
 * @returns {Promise<object>} The newly created material object.
 */
const createMaterial = async (materialData) => {
  const { name, description, supplier, unit, cost_per_unit, min_stock_level } = materialData;
  const { rows } = await pool.query(
    'INSERT INTO materials (name, description, supplier, unit, cost_per_unit, min_stock_level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [name, description, supplier, unit, cost_per_unit, min_stock_level]
  );
  return rows[0];
};

/**
 * Updates an existing material.
 * @param {number} id - The ID of the material to update.
 * @param {object} materialData - The new data for the material.
 * @returns {Promise<object>} The updated material object.
 */
const updateMaterial = async (id, materialData) => {
  const { name, description, supplier, unit, cost_per_unit, min_stock_level, current_stock } = materialData;
  const { rows } = await pool.query(
    'UPDATE materials SET name = $1, description = $2, supplier = $3, unit = $4, cost_per_unit = $5, min_stock_level = $6, current_stock = $7 WHERE id = $8 RETURNING *',
    [name, description, supplier, unit, cost_per_unit, min_stock_level, current_stock, id]
  );
  return rows[0];
};

/**
 * Deletes a material from the database.
 * @param {number} id - The ID of the material to delete.
 * @returns {Promise<object>} The deleted material object.
 */
const deleteMaterial = async (id) => {
  const { rows } = await pool.query('DELETE FROM materials WHERE id = $1 RETURNING *', [id]);
  return rows[0];
};

module.exports = {
    getAllMaterials,
    getMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial,
};
