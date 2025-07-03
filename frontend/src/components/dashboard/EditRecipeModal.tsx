import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';

import { FullRecipe, Material, IngredientFormState } from '../../types';

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
      // Convert numeric recipe data to string-based form state
      const formIngredients = recipe.ingredients.map(ing => ({
        material_id: ing.material_id.toString(),
        quantity: ing.quantity.toString(),
        unit: ing.unit || '',
      }));
      setIngredients(formIngredients);
    } else {
      // Reset form when no recipe is selected (or modal is hidden)
      setName('');
      setVersion('');
      setDescription('');
      setIngredients([]);
    }
  }, [recipe]);

  const handleIngredientChange = (index: number, field: keyof IngredientFormState, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;

    if (field === 'material_id') {
        const selectedMaterial = availableMaterials.find(m => m.id.toString() === value);
        if (selectedMaterial) {
            newIngredients[index].unit = selectedMaterial.unit;
        }
    }

    setIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { material_id: '', quantity: '', unit: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipe) return;

    if (ingredients.some(ing => !ing.material_id || ing.material_id === '' || !ing.quantity || parseFloat(ing.quantity) <= 0)) {
        setError('Please select a material and enter a valid quantity for all ingredients.');
        return;
    }
    setError(null);

    const payload = {
      name,
      version,
      description,
      ingredients: ingredients.map(({ unit, ...rest }) => ({ 
          ...rest, 
          material_id: parseInt(rest.material_id, 10), 
          quantity: parseFloat(rest.quantity) 
      })),
    };

    try {
      await axios.put(`/api/recipes/${recipe.id}`, payload);
      onRecipeUpdated();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to update recipe. Please try again.');
      console.error(err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Recipe</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
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
                <Row key={index} className="mb-2 align-items-center">
                <Col md={5}>
                    <Form.Select
                    aria-label="Select Material"
                    value={ingredient.material_id}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleIngredientChange(index, 'material_id', e.target.value)}
                    >
                    <option value="">Select Material</option>
                    {availableMaterials.map((material) => (
                        <option key={material.id} value={material.id.toString()}>
                            {material.name}
                        </option>
                    ))}
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <Form.Control
                    type="number"
                    placeholder="Quantity"
                    value={ingredient.quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleIngredientChange(index, 'quantity', e.target.value)}
                    />
                </Col>
                <Col md={3}>
                    <Form.Control
                    type="text"
                    placeholder="Unit"
                    value={ingredient.unit}
                    readOnly
                    />
                </Col>
                <Col md={1}>
                    <Button variant="danger" size="sm" onClick={() => handleRemoveIngredient(index)}>X</Button>
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
        <Button variant="primary" onClick={handleSubmit}>Save Changes</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditRecipeModal;
