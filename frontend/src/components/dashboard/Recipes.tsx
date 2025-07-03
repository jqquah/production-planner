import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Table, Button, Alert } from 'react-bootstrap';
import AddRecipeModal from './AddRecipeModal';
import EditRecipeModal from './EditRecipeModal';
import ViewRecipeModal from './ViewRecipeModal';
import './Recipes.css';
// Temporarily defining types here to bypass build cache issues
interface RecipeListItem {
  id: number;
  name: string;
  version: string;
  description: string;
  created_at: string;
}

interface IngredientDetail {
  material_id: number;
  material_name: string;
  percentage: number;
  cost_per_unit: number;
  unit: string;
}

interface FullRecipe {
  id: number;
  name: string;
  version: string;
  description: string;
  ingredients: IngredientDetail[];
  total_cost?: number;
}

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [error, setError] = useState<string>('');
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<FullRecipe | null>(null);

  const fetchRecipes = useCallback(async () => {
    try {
      const response = await axios.get<RecipeListItem[]>('/api/recipes');
      setRecipes(response.data);
    } catch (err) {
      setError('Failed to fetch recipes. Please try again later.');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

    const handleViewClick = async (recipeId: number) => {
    try {
      const response = await axios.get<FullRecipe>(`/api/recipes/${recipeId}`);
      setSelectedRecipe(response.data);
      setViewModalOpen(true);
    } catch (err) {
      setError('Failed to fetch recipe details. Please try again.');
      console.error(err);
    }
  };

  const handleEditClick = async (recipeId: number) => {
    try {
      const response = await axios.get<FullRecipe>(`/api/recipes/${recipeId}`);
      setSelectedRecipe(response.data);
      setEditModalOpen(true);
    } catch (err) {
      setError('Failed to fetch recipe details. Please try again.');
      console.error(err);
    }
  };

  const handleRecipeAdded = () => {
    fetchRecipes();
    setAddModalOpen(false);
  };

  const handleDeleteClick = async (recipeId: number) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await axios.delete(`/api/recipes/${recipeId}`);
        fetchRecipes(); // Refresh the list
      } catch (err) {
        setError('Failed to delete recipe.');
        console.error(err);
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Recipe Management</h2>
        <Button variant="primary" onClick={() => setAddModalOpen(true)}>Add New Recipe</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Version</th>
            <th>Description</th>
            <th>Created At</th>
            <th scope="col" className="actions-column">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map((recipe) => (
            <tr key={recipe.id}>
              <td>{recipe.name}</td>
              <td>{recipe.version}</td>
              <td>{recipe.description}</td>
              <td>{new Date(recipe.created_at).toLocaleDateString()}</td>
              <td>
                <Button variant="info" size="sm" className="me-2" onClick={() => handleViewClick(recipe.id)}>View</Button>
                <Button variant="secondary" size="sm" onClick={() => handleEditClick(recipe.id)}>Edit</Button>
                <Button variant="danger" size="sm" className="ms-2" onClick={() => handleDeleteClick(recipe.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <AddRecipeModal
        show={isAddModalOpen}
        onHide={() => setAddModalOpen(false)}
        onRecipeAdded={handleRecipeAdded}
      />
      <EditRecipeModal
        show={isEditModalOpen}
        onHide={() => setEditModalOpen(false)}
        recipe={selectedRecipe}
        onRecipeUpdated={handleRecipeAdded} // We can reuse the same handler to refresh the list
      />

      <ViewRecipeModal 
        show={isViewModalOpen}
        onHide={() => setViewModalOpen(false)}
        recipe={selectedRecipe}
      />
    </div>
  );
};

export default Recipes;
