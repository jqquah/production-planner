import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';

// Using types defined in other components for now
interface Material {
  id: number;
  name: string;
}

interface AddMaterialBatchModalProps {
  show: boolean;
  onHide: () => void;
  onBatchAdded: () => void;
}

const AddMaterialBatchModal: React.FC<AddMaterialBatchModalProps> = ({ show, onHide, onBatchAdded }) => {
  const [materialId, setMaterialId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [sst, setSst] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [error, setError] = useState('');
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [batchDataToSubmit, setBatchDataToSubmit] = useState<any>(null);

  useEffect(() => {
    if (show) {
      const fetchMaterials = async () => {
        try {
          const res = await axios.get<Material[]>('/api/materials');
          setAvailableMaterials(res.data);
        } catch (err) {
          console.error('Failed to fetch materials', err);
          setError('Could not load materials.');
        }
      };
      fetchMaterials();
      // Reset form state when modal is shown
      setMaterialId('');
      setBatchNumber('');
      setQuantity('');
      setPrice('');
      setSst('');
      setTotalPrice('');
      setExpiryDate('');
      setError('');
      setShowExpiryWarning(false);
      setBatchDataToSubmit(null);
    }
  }, [show]);

  useEffect(() => {
    const q = parseFloat(quantity);
    const p = parseFloat(price);
    const s = parseFloat(sst);

    if (!isNaN(q) && !isNaN(p)) {
      const subtotal = q * p;
      const total = !isNaN(s) ? subtotal * (1 + s / 100) : subtotal;
      setTotalPrice(total.toFixed(2));
    } else {
      setTotalPrice('');
    }
  }, [quantity, price, sst]);

  const proceedWithSubmit = async (data: any) => {
    try {
      await axios.post('/api/inventory/batches', data);
      onBatchAdded();
      onHide();
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || 'Failed to add material batch.';
      setError(errorMsg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const batchData = {
      material_id: parseInt(materialId, 10),
      batch_number: batchNumber,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      sst: parseFloat(sst) || 0,
      total_price: parseFloat(totalPrice),
      expiry_date: expiryDate || null,
    };

    if (expiryDate) {
      const expiry = new Date(expiryDate);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      if (expiry < oneYearFromNow) {
        setBatchDataToSubmit(batchData);
        setShowExpiryWarning(true);
        return;
      }
    }

    await proceedWithSubmit(batchData);
  };

  const handleWarningCancel = () => {
    setShowExpiryWarning(false);
    setBatchDataToSubmit(null);
  };

  const handleWarningProceed = async () => {
    if (batchDataToSubmit) {
      await proceedWithSubmit(batchDataToSubmit);
    }
    setShowExpiryWarning(false);
    setBatchDataToSubmit(null);
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Material Batch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="batch-form" onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label htmlFor="add-batch-material-select">Material</Form.Label>
              <Form.Select 
                id="add-batch-material-select"
                name="material_id"
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                required
              >
                <option value="">Select Material</option>
                {availableMaterials.map((material) => (
                  <option key={material.id} value={material.id}>{material.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="batch-number">
                  <Form.Label>Batch Number</Form.Label>
                  <Form.Control type="text" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="quantity">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required placeholder="e.g., 100.5"/>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="price">
                  <Form.Label>Price per Unit</Form.Label>
                  <Form.Control type="number" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="e.g., 12.50"/>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="sst">
                  <Form.Label>SST (%)</Form.Label>
                  <Form.Control type="number" value={sst} onChange={(e) => setSst(e.target.value)} placeholder="e.g., 6"/>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="total-price">
                  <Form.Label>Total Price</Form.Label>
                  <Form.Control type="text" value={totalPrice ? `$${totalPrice}` : ''} readOnly disabled />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="expiry-date">
                  <Form.Label>Expiry Date</Form.Label>
                  <Form.Control type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Close</Button>
          <Button variant="primary" type="submit" form="batch-form">Save Batch</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showExpiryWarning} onHide={handleWarningCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Expiry Date Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          The expiry date is less than one year from now. Do you want to proceed?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleWarningCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleWarningProceed}>
            Proceed
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddMaterialBatchModal;
