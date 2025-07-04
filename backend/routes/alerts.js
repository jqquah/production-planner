const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const inventoryModel = require('../models/inventoryModel');

// @route   GET api/alerts/low-stock
// @desc    Get all materials with low stock
// @access  Private
router.get('/low-stock', auth, async (req, res) => {
  try {
    const materials = await inventoryModel.getLowStockMaterials();
    res.json(materials);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/alerts/expiring
// @desc    Get all batches expiring soon
// @access  Private
router.get('/expiring', auth, async (req, res) => {
  try {
    // Default to 30 days if not specified
    const days = req.query.days ? parseInt(req.query.days, 10) : 30;
    if (isNaN(days)) {
      return res.status(400).json({ msg: 'Days parameter must be a number.' });
    }

    const batches = await inventoryModel.getExpiringBatches(days);
    res.json(batches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
