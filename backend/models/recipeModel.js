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
 * Retrieves a single recipe by its ID, including its ingredients.
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
            ri.quantity,
            ri.unit,
            m.name as material_name
         FROM recipe_ingredients ri
         JOIN materials m ON ri.material_id = m.id
         WHERE ri.recipe_id = $1`,
        [id]
    );

    const recipe = recipeResult.rows[0];
    recipe.ingredients = ingredientsResult.rows;

    return recipe;
};


module.exports = {
    getAllRecipes,
    getRecipeById,
};
