import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

// A simplified recipe type for the dropdown
interface Recipe {
  id: number;
  name: string;
  version: string;
}

interface CreateProductionBatchModalProps {
  show: boolean;
  onHide: () => void;
  onBatchCreated: () => void;
}

const CreateProductionBatchModal: React.FC<CreateProductionBatchModalProps> = ({ show, onHide, onBatchCreated }) => {
  const [recipeId, setRecipeId] = useState('');
  const [plannedQuantity, setPlannedQuantity] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      // Fetch recipes for the dropdown
      const fetchRecipes = async () => {
        try {
          const response = await axios.get<Recipe[]>('/api/recipes');
          setRecipes(response.data);
        } catch (err) {
          setError('Failed to fetch recipes.');
          console.error(err);
        }
      };
      fetchRecipes();
      
      // Reset form fields when modal is opened
      setRecipeId('');
      setPlannedQuantity('');
      setScheduledDate('');
      setError('');
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!recipeId || !plannedQuantity || !scheduledDate) {
        setError('All fields are required.');
        return;
    }

    const batchData = {
      recipe_id: parseInt(recipeId, 10),
      planned_quantity: parseFloat(plannedQuantity),
      scheduled_date: scheduledDate,
    };

    try {
      await axios.post('/api/production', batchData);
      onBatchCreated();
      onHide();
    } catch (err: any) {
      const errorMsg = err.response?.data?.msg || 'Failed to create production batch.';
      setError(errorMsg);
      console.error(err);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Create New Production Batch</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form id="create-batch-form" onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="formRecipeSelect">
            <Form.Label>Recipe</Form.Label>
            <Form.Select
              aria-label="Recipe"
              title="Select Recipe"
              value={recipeId}
              onChange={(e) => setRecipeId(e.target.value)}
              required
            >
              <option value="">Select a Recipe</option>
              {recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name} (v{recipe.version})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Planned Quantity</Form.Label>
            <Form.Control
              type="number"
              value={plannedQuantity}
              onChange={(e) => setPlannedQuantity(e.target.value)}
              required
              min="0.01"
              step="0.01"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Scheduled Date</Form.Label>
            <Form.Control
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" form="create-batch-form">
          Create Batch
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateProductionBatchModal;
