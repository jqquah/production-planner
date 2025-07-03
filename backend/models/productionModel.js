const pool = require('../db');

/**
 * Retrieves all production batches, joining with recipe information.
 * @returns {Promise<Array<object>>} A list of all production batches.
 */
const getAllProductionBatches = async () => {
    const { rows } = await pool.query(`
        SELECT
            pb.id,
            pb.planned_quantity,
            pb.status,
            pb.scheduled_date,
            r.name as recipe_name,
            r.version as recipe_version
        FROM production_batches pb
        JOIN recipes r ON pb.recipe_id = r.id
        ORDER BY pb.scheduled_date DESC
    `);
    return rows;
};

/**
 * Retrieves a single production batch by its ID, including its details.
 * @param {number} id - The ID of the production batch to retrieve.
 * @returns {Promise<object|null>} The production batch object, or null if not found.
 */
const getProductionBatchById = async (id) => {
    const batchResult = await pool.query('SELECT * FROM production_batches WHERE id = $1', [id]);

    if (batchResult.rows.length === 0) {
        return null;
    }

    const qualityChecksResult = await pool.query(
        'SELECT * FROM quality_checks WHERE production_batch_id = $1 ORDER BY created_at DESC',
        [id]
    );

    const batch = batchResult.rows[0];
    batch.quality_checks = qualityChecksResult.rows;

    return batch;
};

module.exports = {
    getAllProductionBatches,
    getProductionBatchById,
};
