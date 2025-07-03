const pool = require('../db');

/**
 * Retrieves all recipes from the database.
 * @returns {Promise<Array<object>>} A list of all recipes.
 */
const getAllRecipes = async () => {
    const { rows } = await pool.query('SELECT * FROM recipes ORDER BY created_at DESC');
    return rows;
};

/**
 * Retrieves a single recipe by its ID, including its ingredients (now percentages).
 * @param {number} id - The ID of the recipe to retrieve.
 * @returns {Promise<object|null>} The recipe object with ingredients, or null if not found.
 */
const getRecipeById = async (id) => {
    const recipeResult = await pool.query(
        `SELECT
            r.id,
            r.name,
            r.version,
            r.description,
            r.created_at,
            u.username as created_by
         FROM recipes r
         LEFT JOIN users u ON r.created_by = u.id
         WHERE r.id = $1`,
        [id]
    );

    if (recipeResult.rows.length === 0) {
        return null;
    }

    const ingredientsResult = await pool.query(
        `SELECT
            rm.material_id,
            rm.percentage,
            m.name as material_name, -- Alias to match frontend expectation
            m.cost_per_unit,
            m.unit
         FROM recipe_materials rm
         JOIN materials m ON rm.material_id = m.id
         WHERE rm.recipe_id = $1`,
        [id]
    );

    const recipe = recipeResult.rows[0];
    // Manually parse numeric fields that might be returned as strings from the DB
    recipe.ingredients = ingredientsResult.rows.map(ing => ({
        ...ing,
        percentage: parseFloat(ing.percentage),
        cost_per_unit: parseFloat(ing.cost_per_unit)
    }));



    return recipe;
};

/**
 * Creates a new recipe with percentage-based ingredients.
 * @param {object} recipeData - The data for the new recipe.
 * @returns {Promise<object>} The newly created recipe.
 */
const createRecipe = async (recipeData) => {
    const { name, version, description, created_by, ingredients } = recipeData;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const recipeResult = await client.query(
            'INSERT INTO recipes (name, version, description, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, version, description, created_by]
        );
        const newRecipe = recipeResult.rows[0];

        if (ingredients && ingredients.length > 0) {
            for (const ingredient of ingredients) {
                await client.query(
                    'INSERT INTO recipe_materials (recipe_id, material_id, percentage) VALUES ($1, $2, $3)',
                    [newRecipe.id, ingredient.material_id, ingredient.percentage]
                );
            }
        }

        await client.query('COMMIT');
        return newRecipe;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

/**
 * Updates an existing recipe with percentage-based ingredients.
 * @param {number} id - The ID of the recipe to update.
 * @param {object} recipeData - The new data for the recipe.
 * @returns {Promise<object>} The updated recipe.
 */
const updateRecipe = async (id, recipeData) => {
    const { name, version, description, ingredients } = recipeData;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const recipeResult = await client.query(
            'UPDATE recipes SET name = $1, version = $2, description = $3 WHERE id = $4 RETURNING *',
            [name, version, description, id]
        );

        if (recipeResult.rows.length === 0) {
            throw new Error('Recipe not found');
        }

        const updatedRecipe = recipeResult.rows[0];

        // Clear existing ingredients and add the new ones
        await client.query('DELETE FROM recipe_materials WHERE recipe_id = $1', [id]);

        if (ingredients && ingredients.length > 0) {
            for (const ingredient of ingredients) {
                await client.query(
                    'INSERT INTO recipe_materials (recipe_id, material_id, percentage) VALUES ($1, $2, $3)',
                    [id, ingredient.material_id, ingredient.percentage]
                );
            }
        }

        await client.query('COMMIT');
        return updatedRecipe;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

/**
 * Deletes a recipe from the database.
 * @param {number} id - The ID of the recipe to delete.
 */
const deleteRecipe = async (id) => {
    const result = await pool.query('DELETE FROM recipes WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
        throw new Error('Recipe not found');
    }
};

module.exports = {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
};
