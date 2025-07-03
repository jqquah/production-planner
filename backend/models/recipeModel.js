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
 * Retrieves a single recipe by its ID, including its ingredients and total cost.
 * @param {number} id - The ID of the recipe to retrieve.
 * @returns {Promise<object|null>} The recipe object with ingredients and cost, or null if not found.
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
            ri.material_id,
            ri.quantity,
            ri.unit,
            m.name,
            m.cost_per_unit
         FROM recipe_ingredients ri
         JOIN materials m ON ri.material_id = m.id
         WHERE ri.recipe_id = $1`,
        [id]
    );

    const recipe = recipeResult.rows[0];
    recipe.ingredients = ingredientsResult.rows;

    // Calculate total cost
    const totalCost = recipe.ingredients.reduce((total, ing) => {
        const quantity = parseFloat(ing.quantity) || 0;
        const cost = parseFloat(ing.cost_per_unit) || 0;
        return total + (quantity * cost);
    }, 0);
    
    recipe.total_cost = parseFloat(totalCost.toFixed(2));

    return recipe;
};


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
                    'INSERT INTO recipe_ingredients (recipe_id, material_id, quantity, unit) VALUES ($1, $2, $3, $4)',
                    [newRecipe.id, ingredient.material_id, ingredient.quantity, ingredient.unit]
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

        await client.query('DELETE FROM recipe_ingredients WHERE recipe_id = $1', [id]);

        if (ingredients && ingredients.length > 0) {
            for (const ingredient of ingredients) {
                await client.query(
                    'INSERT INTO recipe_ingredients (recipe_id, material_id, quantity, unit) VALUES ($1, $2, $3, $4)',
                    [id, ingredient.material_id, ingredient.quantity, ingredient.unit]
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
