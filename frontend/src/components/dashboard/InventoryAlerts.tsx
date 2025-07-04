import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, ListGroup, Card, Row, Col } from 'react-bootstrap';

interface LowStockMaterial {
  id: number;
  name: string;
  current_stock: number;
  min_stock_level: number;
  unit: string;
}

interface ExpiringBatch {
  id: number;
  material_name: string;
  batch_number: string;
  quantity: number;
  expiry_date: string;
}

const InventoryAlerts: React.FC = () => {
  const [lowStock, setLowStock] = useState<LowStockMaterial[]>([]);
  const [expiring, setExpiring] = useState<ExpiringBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      setError('');
      try {
        const lowStockRes = await axios.get<LowStockMaterial[]>('/api/alerts/low-stock');
        const expiringRes = await axios.get<ExpiringBatch[]>('/api/alerts/expiring?days=30');
        setLowStock(lowStockRes.data);
        setExpiring(expiringRes.data);
      } catch (err) {
        setError('Failed to fetch inventory alerts.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  if (loading) {
    return <p>Loading alerts...</p>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Row className="mt-4">
      <Col md={6}>
        <Card>
          <Card.Header as="h5" className="bg-warning text-white">Low Stock Alerts</Card.Header>
          <ListGroup variant="flush">
            {lowStock.length > 0 ? (
              lowStock.map(item => (
                <ListGroup.Item key={item.id}>
                  <strong>{item.name}</strong> is low on stock.
                  <br />
                  Current: {item.current_stock} {item.unit} | Minimum: {item.min_stock_level} {item.unit}
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item>No low stock alerts.</ListGroup.Item>
            )}
          </ListGroup>
        </Card>
      </Col>
      <Col md={6}>
        <Card>
          <Card.Header as="h5" className="bg-danger text-white">Expiring Soon (30 Days)</Card.Header>
          <ListGroup variant="flush">
            {expiring.length > 0 ? (
              expiring.map(batch => (
                <ListGroup.Item key={batch.id}>
                  Batch <strong>{batch.batch_number}</strong> of <strong>{batch.material_name}</strong>
                  <br />
                  Expires on: {new Date(batch.expiry_date).toLocaleDateString()} | Quantity: {batch.quantity}
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item>No expiring batches found.</ListGroup.Item>
            )}
          </ListGroup>
        </Card>
      </Col>
    </Row>
  );
};

export default InventoryAlerts;
