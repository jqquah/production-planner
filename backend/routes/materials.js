const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
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

// @route   POST api/materials
// @desc    Add a new material
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('unit', 'Unit is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newMaterial = await materialModel.createMaterial(req.body);
      res.json(newMaterial);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/materials/:id
// @desc    Update a material
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let material = await materialModel.getMaterialById(req.params.id);
    if (!material) {
      return res.status(404).json({ msg: 'Material not found' });
    }

    const updatedMaterial = await materialModel.updateMaterial(req.params.id, req.body);
    res.json(updatedMaterial);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/materials/:id
// @desc    Delete a material
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let material = await materialModel.getMaterialById(req.params.id);
    if (!material) {
      return res.status(404).json({ msg: 'Material not found' });
    }

    await materialModel.deleteMaterial(req.params.id);
    res.json({ msg: 'Material removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/materials
// @desc    Add a new material
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('unit', 'Unit is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newMaterial = await materialModel.createMaterial(req.body);
      res.json(newMaterial);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/materials/:id
// @desc    Update a material
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let material = await materialModel.getMaterialById(req.params.id);
    if (!material) {
      return res.status(404).json({ msg: 'Material not found' });
    }

    const updatedMaterial = await materialModel.updateMaterial(req.params.id, req.body);
    res.json(updatedMaterial);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/materials/:id
// @desc    Delete a material
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let material = await materialModel.getMaterialById(req.params.id);
    if (!material) {
      return res.status(404).json({ msg: 'Material not found' });
    }

    await materialModel.deleteMaterial(req.params.id);
    res.json({ msg: 'Material removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
