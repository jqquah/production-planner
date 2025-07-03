const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const productionModel = require('../models/productionModel');

// @route   GET api/production
// @desc    Get all production batches
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const batches = await productionModel.getAllProductionBatches();
        res.json(batches);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/production/:id
// @desc    Get a single production batch by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const batch = await productionModel.getProductionBatchById(req.params.id);
        if (!batch) {
            return res.status(404).json({ msg: 'Production batch not found' });
        }
        res.json(batch);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
