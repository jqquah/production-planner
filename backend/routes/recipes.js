const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const recipeModel = require('../models/recipeModel');

// @route   GET api/recipes
// @desc    Get all recipes
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const recipes = await recipeModel.getAllRecipes();
        res.json(recipes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/recipes/:id
// @desc    Get a single recipe by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const recipe = await recipeModel.getRecipeById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const { check, validationResult } = require('express-validator');

// Validation middleware for recipe ingredients
const ingredientsValidator = [
    check('ingredients', 'Ingredients must be an array').optional().isArray(),
    check('ingredients.*.material_id', 'Each ingredient must have a material ID').isInt(),
    check('ingredients.*.percentage', 'Each ingredient must have a percentage').isNumeric(),
    check('ingredients').custom(ingredients => {
        if (!ingredients || ingredients.length === 0) {
            return true; // No ingredients to validate, or handled by another validator
        }
        const totalPercentage = ingredients.reduce((sum, ing) => sum + parseFloat(ing.percentage || 0), 0);
        if (Math.abs(totalPercentage - 100) > 0.01) { // Use a tolerance for floating point math
            throw new Error('The sum of ingredient percentages must be exactly 100.');
        }
        return true;
    })
];

// @route   POST api/recipes
// @desc    Create a new recipe
// @access  Private
router.post('/', [
    auth,
    check('name', 'Name is required').not().isEmpty(),
    check('version', 'Version is required').not().isEmpty(),
    ...ingredientsValidator
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newRecipe = await recipeModel.createRecipe({ ...req.body, created_by: req.user.id });
        res.status(201).json(newRecipe);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/recipes/:id
// @desc    Update a recipe
// @access  Private
router.put('/:id', [
    auth,
    check('name', 'Name is required').not().isEmpty(),
    check('version', 'Version is required').not().isEmpty(),
    ...ingredientsValidator
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const updatedRecipe = await recipeModel.updateRecipe(req.params.id, req.body);
        res.json(updatedRecipe);
    } catch (err) {
        console.error(err.message);
        if (err.message === 'Recipe not found') {
            return res.status(404).json({ msg: 'Recipe not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/recipes/:id
// @desc    Delete a recipe
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        await recipeModel.deleteRecipe(req.params.id);
        res.json({ msg: 'Recipe removed' });
    } catch (err) {
        console.error(err.message);
        if (err.message === 'Recipe not found') {
            return res.status(404).json({ msg: 'Recipe not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
