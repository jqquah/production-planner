import React from 'react';
import { Modal, Button, Table, Badge } from 'react-bootstrap';

// Temporarily defining types here to bypass build cache issues
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

interface ViewRecipeModalProps {
  show: boolean;
  onHide: () => void;
  recipe: FullRecipe | null;
}

const ViewRecipeModal: React.FC<ViewRecipeModalProps> = ({ show, onHide, recipe }) => {
  if (!recipe) {
    return null;
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>View Recipe: {recipe.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5><Badge bg="primary">Version: {recipe.version}</Badge></h5>
        <p className="mt-3"><strong>Description:</strong></p>
        <p>{recipe.description || 'No description provided.'}</p>

        
        <hr />

        <h5>Ingredients</h5>
        {recipe.ingredients.length > 0 ? (
          <Table striped bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>Material</th>
                <th>Percentage (%)</th>
              </tr>
            </thead>
            <tbody>
              {recipe.ingredients.map((ing, index) => (
                <tr key={index}>
                  <td>{ing.material_name}</td>
                  <td>{ing.percentage.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>This recipe has no ingredients.</p>
        )}

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewRecipeModal;
