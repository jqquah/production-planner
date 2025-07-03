import React from 'react';
import { Modal, Button, Table, Badge } from 'react-bootstrap';

import { FullRecipe } from '../../types';

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
        <h5 className="mt-3"><Badge bg="success">Total Cost: ${recipe.total_cost.toFixed(2)}</Badge></h5>
        
        <hr />

        <h5>Ingredients</h5>
        {recipe.ingredients.length > 0 ? (
            <Table striped bordered hover responsive size="sm">
                <thead>
                    <tr>
                        <th>Material</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Cost per Unit</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {recipe.ingredients.map((ing, index) => (
                        <tr key={index}>
                            <td>{ing.name}</td>
                            <td>{ing.quantity}</td>
                            <td>{ing.unit}</td>
                            <td>${parseFloat(ing.cost_per_unit).toFixed(2)}</td>
                            <td>${(ing.quantity * parseFloat(ing.cost_per_unit)).toFixed(2)}</td>
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
