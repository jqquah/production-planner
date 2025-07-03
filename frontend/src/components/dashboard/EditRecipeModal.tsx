import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';

// Temporarily defining types here to bypass build cache issues
interface Material {
  id: number;
  name: string;
  unit: string;
  cost_per_unit: number;
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
interface IngredientFormState {
  material_id: string;
  percentage: string;
}

const initialIngredientState: IngredientFormState = {
  material_id: '',
  percentage: '',
};

interface EditRecipeModalProps {
  show: boolean;
  onHide: () => void;
  onRecipeUpdated: () => void;
  recipe: FullRecipe | null;
}

const EditRecipeModal: React.FC<EditRecipeModalProps> = ({ show, onHide, onRecipeUpdated, recipe }) => {
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<IngredientFormState[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get<Material[]>('/api/materials');
        setAvailableMaterials(response.data);
      } catch (err) {
        setError('Failed to fetch materials.');
        console.error(err);
      }
    };

    if (show) {
      fetchMaterials();
    }
  }, [show]);

  useEffect(() => {
    if (recipe) {
      setName(recipe.name);
      setVersion(recipe.version);
      setDescription(recipe.description);
      const formIngredients = recipe.ingredients.map(ing => ({
        material_id: ing.material_id.toString(),
        percentage: ing.percentage.toString(),
      }));
      setIngredients(formIngredients);
    } else {
      setName('');
      setVersion('');
      setDescription('');
      setIngredients([initialIngredientState]);
    }
  }, [recipe, show]);

  const handleIngredientChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [name as keyof IngredientFormState]: value };
    setIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, initialIngredientState]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipe) return;

    setError(null);

    const totalPercentage = ingredients.reduce((sum, ing) => {
      return sum + (parseFloat(ing.percentage) || 0);
    }, 0);

    if (Math.abs(totalPercentage - 100) > 0.001) {
      setError('The sum of all ingredient percentages must be exactly 100%.');
      return;
    }

    const payload = {
      name,
      version,
      description,
      ingredients: ingredients.map(ing => ({ 
          material_id: parseInt(ing.material_id, 10), 
          percentage: parseFloat(ing.percentage) 
      })).filter(ing => ing.material_id && ing.percentage > 0),
    };

    try {
      await axios.put(`/api/recipes/${recipe.id}`, payload);
      onRecipeUpdated();
      onHide();
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || 'Failed to update recipe.';
      setError(errorMsg);
      console.error(err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Recipe</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form id="edit-recipe-form" onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={2}>Name</Form.Label>
                <Col sm={10}>
                <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={2}>Version</Form.Label>
                <Col sm={10}>
                <Form.Control type="text" value={version} onChange={(e) => setVersion(e.target.value)} required />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={2}>Description</Form.Label>
                <Col sm={10}>
                <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                </Col>
            </Form.Group>

            <hr />
            <h5>Ingredients</h5>
            {ingredients.map((ingredient, index) => (
                <Row key={index} className="mb-3 align-items-center">
                  <Col md={6}>
                    <Form.Group controlId={`edit-form-material-${index}`}>
                      <Form.Label>Material</Form.Label>
                      <Form.Select
                        name="material_id"
                        value={ingredient.material_id}
                        onChange={(e) => handleIngredientChange(index, e)}
                        required
                      >
                        <option value="">Select Material</option>
                        {availableMaterials.map((material) => (
                            <option key={material.id} value={material.id.toString()}>
                                {material.name}
                            </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId={`edit-form-percentage-${index}`}>
                      <Form.Label>Percentage (%)</Form.Label>
                      <Form.Control
                        type="number"
                        name="percentage"
                        placeholder="e.g., 80.5"
                        value={ingredient.percentage}
                        onChange={(e) => handleIngredientChange(index, e)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <Button variant="danger" onClick={() => handleRemoveIngredient(index)} className="w-100">X</Button>
                  </Col>
                </Row>
            ))}
            <Button variant="secondary" onClick={handleAddIngredient} className="mt-2">
                Add Ingredient
            </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" type="submit" form="edit-recipe-form">Save Changes</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditRecipeModal;
