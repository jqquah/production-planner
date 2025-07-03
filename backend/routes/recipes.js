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

module.exports = router;
