import React, { useState, useEffect, useCallback } from 'react';
import { Table, Alert, Spinner, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';

interface InventoryHistoryRecord {
  id: number;
  created_at: string;
  material_name: string;
  batch_number: string | null;
  user_name: string | null;
  change_type: string;
  quantity_change: number;
  new_stock_level: number;
  reason: string | null;
}

const InventoryHistory: React.FC = () => {
  const [history, setHistory] = useState<InventoryHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [materialNames, setMaterialNames] = useState<string[]>([]);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (materialName) params.append('materialName', materialName);
      if (batchNumber) params.append('batchNumber', batchNumber);

      const res = await axios.get<InventoryHistoryRecord[]>('/api/inventory/history', { params });
      setHistory(res.data);
    } catch (err) {
      setError('Failed to fetch inventory history.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [materialName, batchNumber]);

  useEffect(() => {
    const fetchMaterialNames = async () => {
      try {
        const res = await axios.get<string[]>('/api/inventory/materials/names');
        setMaterialNames(res.data);
      } catch (err) {
        console.error('Failed to fetch material names.', err);
      }
    };

    fetchMaterialNames();
    fetchHistory();
  }, [fetchHistory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <h2>Inventory History</h2>

      <Form onSubmit={handleSearch} className="mb-3">
        <Row className="align-items-end">
          <Col md={4}>
            <Form.Group controlId="materialNameSearch">
              <Form.Label>Material Name</Form.Label>
              <Form.Select
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
              >
                <option value="">All Materials</option>
                {materialNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="batchNumberSearch">
              <Form.Label>Batch Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter batch number"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Button variant="primary" type="submit">Search</Button>
          </Col>
        </Row>
      </Form>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Date</th>
            <th>Material</th>
            <th>Batch</th>
            <th>User</th>
            <th>Change Type</th>
            <th>Quantity Change</th>
            <th>New Stock Level</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {history.length > 0 ? (
            history.map((record) => (
              <tr key={record.id}>
                <td>{new Date(record.created_at).toLocaleString()}</td>
                <td>{record.material_name}</td>
                <td>{record.batch_number || 'N/A'}</td>
                <td>{record.user_name || 'System'}</td>
                <td>{record.change_type}</td>
                <td>{record.quantity_change}</td>
                <td>{record.new_stock_level}</td>
                <td>{record.reason || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center">No history found.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default InventoryHistory;
