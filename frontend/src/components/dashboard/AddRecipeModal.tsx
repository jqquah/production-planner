import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';

import { Material, IngredientFormState } from '../../types';

interface AddRecipeModalProps {
  show: boolean;
  onHide: () => void;
  onRecipeAdded: () => void;
}

const AddRecipeModal: React.FC<AddRecipeModalProps> = ({ show, onHide, onRecipeAdded }) => {
  const [name, setName] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<IngredientFormState[]>([{ material_id: '', quantity: '', unit: '' }]);
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      const fetchMaterials = async () => {
        try {
          const response = await axios.get<Material[]>('/api/materials');
          setAvailableMaterials(response.data);
        } catch (err) {
          setError('Failed to fetch materials.');
        }
      };
      fetchMaterials();
    }
  }, [show]);

  const handleIngredientChange = (index: number, field: keyof IngredientFormState, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;

    if (field === 'material_id') {
        const selectedMaterial = availableMaterials.find(m => m.id === parseInt(value, 10));
        if (selectedMaterial) {
            newIngredients[index].unit = selectedMaterial.unit;
        }
    }

    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { material_id: '', quantity: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !version) {
      setError('Recipe Name and Version are required.');
      return;
    }

    const payload = {
      name,
      version,
      description,
      ingredients: ingredients.filter(ing => ing.material_id && ing.quantity).map(ing => ({
        ...ing,
        material_id: parseInt(ing.material_id, 10),
        quantity: parseFloat(ing.quantity)
      })),
    };

    try {
      await axios.post('/api/recipes', payload);
      onRecipeAdded();
      onHide();
      // Reset form
      setName('');
      setVersion('1.0.0');
      setDescription('');
      setIngredients([{ material_id: '', quantity: '', unit: '' }]);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to add recipe.');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Recipe</Modal.Title>
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
                        <option key={material.id} value={material.id}>{material.name}</option>
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
                    <Button variant="danger" size="sm" onClick={() => removeIngredient(index)}>X</Button>
                </Col>
                </Row>
            ))}
            <Button variant="secondary" onClick={addIngredient} className="mt-2">
                Add Ingredient
            </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Save Recipe</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddRecipeModal;
