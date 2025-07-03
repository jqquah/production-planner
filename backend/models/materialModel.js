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

module.exports = {
    getAllMaterials,
    getMaterialById,
};
