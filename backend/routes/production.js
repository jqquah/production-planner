const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const productionModel = require('../models/productionModel');
const { check, validationResult } = require('express-validator');

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

// @route   POST api/production
// @desc    Create a new production batch
// @access  Private
router.post('/', [
    auth,
    check('recipe_id', 'Recipe ID is required').isInt(),
    check('planned_quantity', 'Planned quantity must be a positive number').isFloat({ gt: 0 }),
    check('scheduled_date', 'A valid scheduled date is required').isISO8601().toDate(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newBatch = await productionModel.createProductionBatch({ 
            ...req.body, 
            created_by: req.user.id 
        });
        res.status(201).json(newBatch);
    } catch (err) {
        console.error(err.message);
        // Provide a more specific error message if it's an insufficient stock error
        if (err.message.startsWith('Insufficient stock')) {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
