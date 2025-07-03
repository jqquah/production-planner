const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const materialModel = require('../models/materialModel');

// @route   GET api/materials
// @desc    Get all materials
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const materials = await materialModel.getAllMaterials();
        res.json(materials);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/materials/:id
// @desc    Get a single material by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const material = await materialModel.getMaterialById(req.params.id);
        if (!material) {
            return res.status(404).json({ msg: 'Material not found' });
        }
        res.json(material);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
