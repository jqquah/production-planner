import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Table, Button, Alert } from 'react-bootstrap';
import CreateProductionBatchModal from './CreateProductionBatchModal';

interface ProductionBatch {
  id: number;
  recipe_name: string;
  recipe_version: string;
  planned_quantity: number;
  status: string;
  scheduled_date: string;
}

const Production: React.FC = () => {
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchBatches = useCallback(async () => {
    try {
      const response = await axios.get<ProductionBatch[]>('/api/production');
      setBatches(response.data);
    } catch (err) {
      setError('Failed to fetch production batches.');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleBatchCreated = () => {
    fetchBatches(); // Refresh the list after a new batch is created
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Production Batches</h2>
        <Button variant="primary" onClick={() => setModalOpen(true)}>Create New Batch</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Recipe</th>
            <th>Version</th>
            <th>Planned Quantity</th>
            <th>Status</th>
            <th>Scheduled Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => (
            <tr key={batch.id}>
              <td>{batch.id}</td>
              <td>{batch.recipe_name}</td>
              <td>{batch.recipe_version}</td>
              <td>{batch.planned_quantity}</td>
              <td>{batch.status}</td>
              <td>{new Date(batch.scheduled_date).toLocaleDateString()}</td>
              <td>
                <Button variant="info" size="sm">View</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <CreateProductionBatchModal
        show={isModalOpen}
        onHide={() => setModalOpen(false)}
        onBatchCreated={handleBatchCreated}
      />
    </div>
  );
};

export default Production;
