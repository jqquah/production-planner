import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Material, MaterialBatch } from '../../types';

interface AdjustStockModalProps {
  show: boolean;
  onHide: () => void;
  batch: MaterialBatch | null;
  material: Material | null;
  onAdjustmentSuccess: () => void;
}

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({ show, onHide, batch, material, onAdjustmentSuccess }) => {
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const costPerUnit = material?.cost_per_unit || 0;
  const adjustmentValue = parseFloat(adjustmentQuantity);
  const costExclusiveSST = !isNaN(adjustmentValue) ? adjustmentValue * costPerUnit : 0;
  const sstRate = 0.06; // 6% SST, can be made configurable
  const sstAmount = costExclusiveSST * sstRate;
  const totalCost = costExclusiveSST + sstAmount;

  if (!show || !batch || !material) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!batch) {
      setError('No batch selected.');
      return;
    }

    if (isNaN(adjustmentValue) || adjustmentValue === 0) {
      setError('Please enter a valid, non-zero quantity.');
      return;
    }

    if (!reason) {
      setError('Reason for adjustment is required.');
      return;
    }

    try {
      await axios.post(`/api/inventory/batches/${batch.id}/adjust`, { 
        adjustmentQuantity: adjustmentValue,
        reason: reason
      });
      onAdjustmentSuccess();
      onHide();
      setAdjustmentQuantity('');
      setReason('');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to adjust stock.');
      console.error(err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Adjust Stock for Batch #{batch?.batch_number}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}
          <p>Current Quantity: <strong>{batch?.quantity}</strong></p>
          <Form.Group className="mb-3">
            <Form.Label>Adjustment Quantity</Form.Label>
            <Form.Control
              type="number"
              value={adjustmentQuantity}
              onChange={(e) => setAdjustmentQuantity(e.target.value)}
              placeholder="Enter positive (add) or negative (remove) value"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Reason for Adjustment</Form.Label>
            <Form.Control as="textarea" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} required />
          </Form.Group>

          <hr />

          <h5>Pricing Details</h5>
          <p><strong>Unit Price:</strong> ${costPerUnit.toFixed(2)}</p>
          <p><strong>Cost (excl. SST):</strong> ${costExclusiveSST.toFixed(2)}</p>
          <p><strong>SST (6%):</strong> ${sstAmount.toFixed(2)}</p>
          <p><strong>Total Cost:</strong> ${totalCost.toFixed(2)}</p>

          <Button variant="primary" type="submit">Save Adjustment</Button>
          <Button variant="secondary" onClick={onHide} className="ms-2">Cancel</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AdjustStockModal;
