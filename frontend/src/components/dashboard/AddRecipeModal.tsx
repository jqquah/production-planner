import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Material } from '../../types';

interface IngredientFormState {
  material_id: string;
  percentage: string;
}

const initialIngredientState: IngredientFormState = {
  material_id: '',
  percentage: '',
};

interface AddRecipeModalProps {
  show: boolean;
  onHide: () => void;
  onRecipeAdded: () => void;
}

const AddRecipeModal: React.FC<AddRecipeModalProps> = ({ show, onHide, onRecipeAdded }) => {
  const [name, setName] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<IngredientFormState[]>([initialIngredientState]);
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      const fetchMaterials = async () => {
        try {
          const res = await axios.get<Material[]>('/api/materials');
          setAvailableMaterials(res.data);
        } catch (err) {
          console.error('Failed to fetch materials', err);
        }
      };
      fetchMaterials();
    }
  }, [show]);

  const handleIngredientChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [name as keyof IngredientFormState]: value };
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, initialIngredientState]);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Validate that the percentages sum to 100
    const totalPercentage = ingredients.reduce((sum, ing) => {
      return sum + (parseFloat(ing.percentage) || 0);
    }, 0);

    // Use a small tolerance for floating point comparison
    if (Math.abs(totalPercentage - 100) > 0.001) {
      setError('The sum of all ingredient percentages must be exactly 100%.');
      return;
    }

    const recipeData = {
      name,
      version,
      description,
      ingredients: ingredients.filter(ing => ing.material_id && ing.percentage).map(ing => ({
        ...ing,
        material_id: parseInt(ing.material_id, 10),
        percentage: parseFloat(ing.percentage)
      })),
    };

    try {
      await axios.post('/api/recipes', recipeData);
      onRecipeAdded();
      onHide();
      // Reset form
      setName('');
      setVersion('1.0.0');
      setDescription('');
      setIngredients([initialIngredientState]);
    } catch (err: any) {
        const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || 'Failed to add recipe.';
        setError(errorMsg);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Recipe</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form id="recipe-form" onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2}>Name</Form.Label>
            <Col sm={10}>
              <Form.Control type="text" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2}>Version</Form.Label>
            <Col sm={10}>
              <Form.Control type="text" value={version} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVersion(e.target.value)} required />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2}>Description</Form.Label>
            <Col sm={10}>
              <Form.Control as="textarea" rows={3} value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} />
            </Col>
          </Form.Group>

          <hr />
          <h5>Ingredients</h5>
          {ingredients.map((ingredient, index) => (
            <Row key={index} className="mb-3 align-items-center">
              <Form.Group as={Col} md={6}>
                <Form.Label htmlFor={`form-ingredient-material-${index}`}>Material</Form.Label>
                <Form.Select
                  id={`form-ingredient-material-${index}`}
                  value={ingredient.material_id}
                  name="material_id"
                  onChange={(e) => handleIngredientChange(index, e)}
                  required
                >
                  <option value="">Select Material</option>
                  {availableMaterials.map((material) => (
                    <option key={material.id} value={material.id}>{material.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Col md={4}>
                <Form.Group controlId={`form-percentage-${index}`}>
                  <Form.Label>Percentage (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="percentage"
                    value={ingredient.percentage}
                    onChange={(e) => handleIngredientChange(index, e)}
                    placeholder="e.g., 80.5"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button variant="danger" onClick={() => removeIngredient(index)} className="w-100">X</Button>
              </Col>
            </Row>
          ))}
          <Button variant="secondary" onClick={addIngredient} className="mt-2">
            Add Ingredient
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" type="submit" form="recipe-form">Save Recipe</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddRecipeModal;
