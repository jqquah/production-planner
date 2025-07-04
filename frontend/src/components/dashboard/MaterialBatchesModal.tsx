import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Table, Alert } from 'react-bootstrap';
import axios from 'axios';
import AdjustStockModal from './AdjustStockModal';
import { Material, MaterialBatch } from '../../types';

interface MaterialBatchesModalProps {
  show: boolean;
  onHide: () => void;
  material: Material | null;
}

const MaterialBatchesModal: React.FC<MaterialBatchesModalProps> = ({ show, onHide, material }) => {
  const [batches, setBatches] = useState<MaterialBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<MaterialBatch | null>(null);

  const fetchBatches = useCallback(async () => {
    if (!material) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get<any[]>(`/api/inventory/materials/${material.id}/batches`);
      const batchesData = res.data.map(b => ({
        ...b,
        quantity: parseFloat(b.quantity) || 0,
        total_price: parseFloat(b.total_price) || 0,
      }));
      setBatches(batchesData);
    } catch (err) {
      setError('Failed to fetch material batches.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [material]);

  useEffect(() => {
    if (show && material) {
      fetchBatches();
    }
  }, [show, material, fetchBatches]);

  const handleAdjustClick = (batch: MaterialBatch) => {
    setSelectedBatch(batch);
    setIsAdjustModalOpen(true);
  };

  const handleAdjustmentSuccess = () => {
    fetchBatches(); // Re-fetch batches to show updated quantity
    setIsAdjustModalOpen(false); // Close the adjustment modal
  };

  const totals = React.useMemo(() => {
    if (!batches || batches.length === 0) {
      return { totalQuantity: 0, totalCost: 0 };
    }
    return batches.reduce(
      (acc, batch) => {
        acc.totalQuantity += Number(batch.quantity) || 0;
        acc.totalCost += Number(batch.total_price) || 0;
        return acc;
      },
      { totalQuantity: 0, totalCost: 0 }
    );
  }, [batches]);

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Batches for: {material?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading ? (
            <p>Loading batches...</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Batch Number</th>
                  <th>Quantity</th>
                  <th>Total Cost</th>
                  <th>Expiry Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.length > 0 ? (
                  batches.map((batch) => (
                    <tr key={batch.id}>
                      <td>{batch.batch_number}</td>
                      <td>{batch.quantity.toFixed(2)}</td>
                      <td>${batch.total_price ? batch.total_price.toFixed(2) : '0.00'}</td>
                      <td>{batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <Button variant="primary" size="sm" onClick={() => handleAdjustClick(batch)}>Adjust Stock</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">No batches found for this material.</td>
                  </tr>
                )}
              </tbody>
              {batches.length > 0 && (
                <tfoot>
                  <tr>
                    <th className="text-end">Total</th>
                    <th>{totals.totalQuantity.toFixed(2)}</th>
                    <th>${totals.totalCost.toFixed(2)}</th>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Close</Button>
        </Modal.Footer>
      </Modal>

      <AdjustStockModal
        show={isAdjustModalOpen}
        onHide={() => setIsAdjustModalOpen(false)}
        batch={selectedBatch}
        material={material}
        onAdjustmentSuccess={handleAdjustmentSuccess}
      />
    </>
  );
};

export default MaterialBatchesModal;
