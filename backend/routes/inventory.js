const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const inventoryModel = require('../models/inventoryModel');

// @route   POST api/inventory/batches
// @desc    Add a new material batch
// @access  Private (Admin or Production Manager)
router.post(
  '/batches',
  [
    auth, // Add authorization middleware
    [
      check('material_id', 'Material is required').not().isEmpty(),
      check('batch_number', 'Batch number is required').not().isEmpty(),
      check('quantity', 'Please enter a valid quantity').isFloat({ gt: 0 }),
      check('price_per_unit', 'Please enter a valid price').optional().isFloat({ gt: -1 }),
      check('sst_percentage', 'Please enter a valid SST value').optional().isFloat({ gt: -1 }),
      check('total_price', 'Please enter a valid total price').optional().isFloat({ gt: -1 }),
      check('expiry_date', 'Expiry date is required').optional({ checkFalsy: true }).isISO8601().toDate(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ msg: 'Authentication error: User ID not found.' });
      }

      const { material_id, batch_number, quantity, expiry_date, price_per_unit, sst_percentage, total_price } = req.body;

      const batchData = {
        material_id: parseInt(material_id, 10),
        batch_number,
        quantity: parseFloat(quantity),
        expiry_date: expiry_date || null,
        price_per_unit: price_per_unit ? parseFloat(price_per_unit) : null,
        sst_percentage: sst_percentage ? parseFloat(sst_percentage) : null,
        total_price: total_price ? parseFloat(total_price) : null,
      };

      // Use the authenticated user's ID from the token, not from the request body
      const newBatch = await inventoryModel.addMaterialBatch(batchData, req.user.id);
      res.status(201).json(newBatch);
    } catch (err) {
      console.error(err.message);
      if (err.code === '23505') { // Unique constraint violation
        return res.status(400).json({ msg: 'This batch number already exists for this material.' });
      }
      if (err.message.includes('Material not found')) {
        return res.status(404).json({ msg: err.message });
      }
      if (err.message.includes('Failed to calculate new stock level')) {
        return res.status(500).json({ msg: 'Database error: Material stock is not initialized. Please set an initial stock value.' });
      }
      // Fallback for any other errors
      res.status(500).json({ msg: 'An unexpected server error occurred while adding the batch.' });
    }
  }
);

// @route   POST api/inventory/batches/:id/adjust
// @desc    Adjust stock for a material batch
// @access  Private (Admin or Production Manager)
router.post(
  '/batches/:id/adjust',
  [
    auth,
    [
      check('adjustmentQuantity', 'Adjustment quantity must be a valid number.').isFloat(),
      check('reason', 'Reason for adjustment is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ msg: 'Authentication error: User ID not found.' });
      }
      const { id } = req.params;
      const { adjustmentQuantity, reason } = req.body;
      const numericAdjustment = parseFloat(adjustmentQuantity);

      const updatedBatch = await inventoryModel.adjustStock(parseInt(id, 10), numericAdjustment, req.user.id, reason);
      res.json(updatedBatch);
    } catch (err) {
      console.error(err.message);
      if (err.code === '23502' || (err.message && err.message.includes('uninitialized'))) {
        return res.status(500).json({ msg: 'Database error: Material stock is not initialized. Please set an initial stock value.' });
      }
      if (err.message.includes('Insufficient stock')) {
        return res.status(400).json({ msg: err.message });
      }
      if (err.message.includes('Batch not found')) {
        return res.status(404).json({ msg: err.message });
      }
      if (err.message.includes('Material associated with this batch not found')) {
        return res.status(404).json({ msg: err.message });
      }
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

// @route   GET api/inventory/materials/:materialId/batches
// @desc    Get all batches for a specific material
// @access  Private
router.get('/materials/:materialId/batches', auth, async (req, res) => {
  try {
    const { materialId } = req.params;
    const batches = await inventoryModel.getBatchesByMaterialId(parseInt(materialId, 10));
    res.json(batches);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'An unexpected server error occurred.' });
  }
});

// @route   GET /api/inventory/history
// @desc    Get inventory history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { materialName, batchNumber } = req.query;
    const history = await inventoryModel.getInventoryHistory({ materialName, batchNumber });
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'An unexpected server error occurred.' });
  }
});

// @route   GET /api/inventory/materials/names
// @desc    Get all unique material names
// @access  Private
router.get('/materials/names', auth, async (req, res) => {
  try {
    const names = await inventoryModel.getAllMaterialNames();
    res.json(names);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'An unexpected server error occurred.' });
  }
});

// @route   GET /api/inventory/stock-report
// @desc    Get current stock report for all materials
// @access  Private
router.get('/stock-report', auth, async (req, res) => {
  try {
    const report = await inventoryModel.getCurrentStockReport();
    res.json(report);
  } catch (error) {
    console.error('Failed to get current stock report:', error);
    res.status(500).send('Server error');
  }
});

// Get expiring materials report
router.get('/expiring-report', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 30; // Default to 30 days
    const report = await inventoryModel.getExpiringBatches(days);
    res.json(report);
  } catch (error) {
    console.error('Failed to get expiring materials report:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
