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

const createProductionBatch = async (batchData) => {
    const { recipe_id, planned_quantity, scheduled_date, created_by } = batchData;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Get recipe ingredients
        const recipeIngredientsResult = await client.query(
            `SELECT material_id, percentage FROM recipe_materials WHERE recipe_id = $1`,
            [recipe_id]
        );
        if (recipeIngredientsResult.rows.length === 0) {
            throw new Error('Recipe has no ingredients or does not exist.');
        }
        const ingredients = recipeIngredientsResult.rows;

        // 2. For each ingredient, check stock and prepare deductions
        const deductions = [];
        for (const ingredient of ingredients) {
            const requiredQuantity = planned_quantity * (parseFloat(ingredient.percentage) / 100);

            // Get available batches for this material, FIFO (oldest first)
            const materialBatchesResult = await client.query(
                `SELECT id, quantity FROM material_batches WHERE material_id = $1 AND quantity > 0 ORDER BY received_date ASC`,
                [ingredient.material_id]
            );
            const availableBatches = materialBatchesResult.rows;

            let quantityToDeduct = requiredQuantity;
            let totalAvailable = availableBatches.reduce((sum, batch) => sum + parseFloat(batch.quantity), 0);

            if (totalAvailable < requiredQuantity) {
                const materialNameResult = await client.query('SELECT name FROM materials WHERE id = $1', [ingredient.material_id]);
                const materialName = materialNameResult.rows[0]?.name || `ID ${ingredient.material_id}`;
                throw new Error(`Insufficient stock for material: ${materialName}. Required: ${requiredQuantity.toFixed(2)}, Available: ${totalAvailable.toFixed(2)}`);
            }

            for (const batch of availableBatches) {
                if (quantityToDeduct <= 0) break;

                const quantityFromThisBatch = Math.min(parseFloat(batch.quantity), quantityToDeduct);
                
                deductions.push({
                    material_batch_id: batch.id,
                    quantity_used: quantityFromThisBatch,
                    material_id: ingredient.material_id,
                });

                quantityToDeduct -= quantityFromThisBatch;
            }
        }

        // 3. Create the production batch record
        const productionBatchResult = await client.query(
            `INSERT INTO production_batches (recipe_id, planned_quantity, scheduled_date, created_by)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [recipe_id, planned_quantity, scheduled_date, created_by]
        );
        const newProductionBatchId = productionBatchResult.rows[0].id;

        // 4. Apply deductions and record history
        for (const deduction of deductions) {
            // Update material batch quantity
            await client.query(
                `UPDATE material_batches SET quantity = quantity - $1 WHERE id = $2`,
                [deduction.quantity_used, deduction.material_batch_id]
            );

            // Link material batch to production batch
            await client.query(
                `INSERT INTO batch_materials (production_batch_id, material_batch_id, quantity_used)
                 VALUES ($1, $2, $3)`,
                [newProductionBatchId, deduction.material_batch_id, deduction.quantity_used]
            );

            // Update total stock in materials table
            const stockUpdateResult = await client.query(
                `UPDATE materials SET current_stock = current_stock - $1 WHERE id = $2 RETURNING current_stock`,
                [deduction.quantity_used, deduction.material_id]
            );
            const newStockLevel = stockUpdateResult.rows[0].current_stock;

            // Record in inventory history
            await client.query(
                `INSERT INTO inventory_history (material_id, batch_id, user_id, change_type, quantity_change, new_stock_level, reason)
                 VALUES ($1, $2, $3, 'production_use', $4, $5, $6)`,
                [
                    deduction.material_id,
                    deduction.material_batch_id,
                    created_by,
                    -deduction.quantity_used,
                    newStockLevel,
                    `Used in production batch #${newProductionBatchId}`
                ]
            );
        }

        await client.query('COMMIT');

        // Return the full batch details
        return getProductionBatchById(newProductionBatchId);

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

module.exports = {
    getAllProductionBatches,
    getProductionBatchById,
    createProductionBatch,
};
