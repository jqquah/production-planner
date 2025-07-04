const pool = require('../db');

/**
 * Adds a new batch of a material to the inventory and logs the change.
 * @param {object} batchDetails - The data for the new material batch.
 * @param {number} userId - The ID of the user performing the action.
 * @returns {Promise<object>} The newly created material batch.
 */
const addMaterialBatch = async (batchDetails, userId) => {
    const { material_id, batch_number, quantity, expiry_date, price_per_unit, sst_percentage, total_price } = batchDetails;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insert the new batch
    const batchInsertQuery = `
            INSERT INTO material_batches (material_id, batch_number, quantity, expiry_date, price_per_unit, sst_percentage, total_price)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
        const batchInsertValues = [material_id, batch_number, quantity, expiry_date, price_per_unit, sst_percentage, total_price];
    const newBatchResult = await client.query(batchInsertQuery, batchInsertValues);
    const newBatch = newBatchResult.rows[0];

    // 2. Update the material's total stock and get the new stock level
    const updateStockQuery = `
      UPDATE materials
      SET current_stock = COALESCE(current_stock, 0) + $1
      WHERE id = $2
      RETURNING current_stock;
    `;
    const updatedMaterialResult = await client.query(updateStockQuery, [quantity, material_id]);
    if (updatedMaterialResult.rows.length === 0) {
      throw new Error('Material not found.');
    }
    const newStockLevel = updatedMaterialResult.rows[0].current_stock;

    if (newStockLevel == null) { // Using == to catch both null and undefined
      throw new Error('Failed to calculate new stock level. The current stock for the material might be uninitialized (NULL).');
    }

    // 3. Log the inventory change
    const historyInsertQuery = `
      INSERT INTO inventory_history (material_id, batch_id, user_id, change_type, quantity_change, new_stock_level, reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;
    const reason = `Added new batch: ${newBatch.batch_number || 'N/A'}`;
    const historyInsertValues = [material_id, newBatch.id, userId, 'batch_add', quantity, newStockLevel, reason];
    await client.query(historyInsertQuery, historyInsertValues);

    await client.query('COMMIT');
    return newBatch;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Adjusts the stock quantity of a specific material batch and logs the change.
 * @param {number} batchId - The ID of the material batch to adjust.
 * @param {number} adjustmentQuantity - The quantity to add (positive) or remove (negative).
 * @param {number} userId - The ID of the user performing the action.
 * @param {string} reason - The reason for the adjustment.
 * @returns {Promise<object>} The updated material batch.
 */
const adjustStock = async (batchId, adjustmentQuantity, userId, reason) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get current batch details
    const batchRes = await client.query('SELECT quantity, material_id FROM material_batches WHERE id = $1 FOR UPDATE', [batchId]);
    if (batchRes.rows.length === 0) {
      throw new Error('Batch not found.');
    }
    const { quantity: currentQuantity, material_id: materialId } = batchRes.rows[0];

    // 2. Check for sufficient stock if removing
    if (adjustmentQuantity < 0 && parseFloat(currentQuantity) < Math.abs(adjustmentQuantity)) {
      throw new Error('Insufficient stock in this batch.');
    }

    // 3. Update the batch quantity
    const updatedBatchResult = await client.query(
      'UPDATE material_batches SET quantity = quantity + $1 WHERE id = $2 RETURNING *',
      [adjustmentQuantity, batchId]
    );

    // 4. Update the total stock in materials and get the new level
    const updatedMaterialResult = await client.query(
      'UPDATE materials SET current_stock = COALESCE(current_stock, 0) + $1 WHERE id = $2 RETURNING current_stock',
      [adjustmentQuantity, materialId]
    );
    if (updatedMaterialResult.rows.length === 0) {
      throw new Error('Material associated with this batch not found.');
    }
    const newStockLevel = updatedMaterialResult.rows[0].current_stock;

    if (newStockLevel == null) { // Using == to catch both null and undefined
      throw new Error('Failed to calculate new stock level. The current stock for the material might be uninitialized (NULL).');
    }

    // 5. Log the inventory change
    const historyInsertQuery = `
      INSERT INTO inventory_history (material_id, batch_id, user_id, change_type, quantity_change, new_stock_level, reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;
    const historyInsertValues = [materialId, batchId, userId, 'manual_adjustment', adjustmentQuantity, newStockLevel, reason];
    await client.query(historyInsertQuery, historyInsertValues);

    await client.query('COMMIT');
    return updatedBatchResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Gets all batches for a specific material.
 * @param {number} materialId - The ID of the material.
 * @returns {Promise<Array>} A list of material batches.
 */
const getBatchesByMaterialId = async (materialId) => {
  const res = await pool.query(
    `SELECT
      id,
      material_id,
      batch_number,
      quantity,
      received_date,
      expiry_date,
      price_per_unit,
      sst_percentage,
      COALESCE(
        total_price,
        (quantity * price_per_unit * (1 + COALESCE(sst_percentage, 0) / 100.0))
      ) as total_price
     FROM material_batches
     WHERE material_id = $1
     ORDER BY expiry_date ASC, received_date DESC`,
    [materialId]
  );
  return res.rows;
};

/**
 * Gets all materials that are at or below their minimum stock level.
 * @returns {Promise<Array>} A list of low-stock materials.
 */
const getLowStockMaterials = async () => {
  const res = await pool.query(
    'SELECT * FROM materials WHERE current_stock <= min_stock_level AND min_stock_level > 0'
  );
  return res.rows;
};

/**
 * Gets all material batches that are expiring within a given number of days.
 * @param {number} days - The number of days to check for expiry.
 * @returns {Promise<Array>} A list of expiring material batches.
 */
const getExpiringBatches = async (days) => {
  const res = await pool.query(
    `SELECT b.*, m.name as material_name
     FROM material_batches b
     JOIN materials m ON b.material_id = m.id
     WHERE b.expiry_date IS NOT NULL
       AND b.expiry_date <= CURRENT_DATE + ($1 * INTERVAL '1 day')`, [days]
  );
  return res.rows;
};

/**
 * Gets the inventory history with optional filters.
 * @param {object} filters - Optional filters for the query.
 * @param {string} filters.materialName - Filter by material name.
 * @param {string} filters.batchNumber - Filter by batch number.
 * @returns {Promise<Array>} A list of inventory history records.
 */
const getInventoryHistory = async (filters = {}) => {
  const { materialName, batchNumber } = filters;
  let query = `
    SELECT
      h.id,
      h.created_at,
      m.name as material_name,
      b.batch_number,
      u.username as user_name,
      h.change_type,
      h.quantity_change,
      h.new_stock_level,
      h.reason
    FROM inventory_history h
    JOIN materials m ON h.material_id = m.id
    LEFT JOIN material_batches b ON h.batch_id = b.id
    LEFT JOIN users u ON h.user_id = u.id
  `;

  const whereClauses = [];
  const queryParams = [];
  let paramIndex = 1;

  if (materialName) {
    whereClauses.push(`m.name ILIKE $${paramIndex++}`);
    queryParams.push(`%${materialName}%`);
  }

  if (batchNumber) {
    whereClauses.push(`b.batch_number ILIKE $${paramIndex++}`);
    queryParams.push(`%${batchNumber}%`);
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  query += ' ORDER BY h.created_at DESC;';

  const res = await pool.query(query, queryParams);
  return res.rows;
};

const getAllMaterialNames = async () => {
  const res = await pool.query('SELECT name FROM materials ORDER BY name ASC');
  return res.rows.map(row => row.name);
};

const getCurrentStockReport = async () => {
  const query = `
    SELECT id, name, current_stock, unit
    FROM materials
    ORDER BY name ASC;
  `;
  const res = await pool.query(query);
  return res.rows;
};

module.exports = {
  addMaterialBatch,
  adjustStock,
  getBatchesByMaterialId,
  getLowStockMaterials,
  getExpiringBatches,
  getInventoryHistory,
  getAllMaterialNames,
  getCurrentStockReport,
};
