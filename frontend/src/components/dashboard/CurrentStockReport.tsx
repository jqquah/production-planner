import React, { useState, useEffect } from 'react';
import { Table, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

interface StockRecord {
  id: number;
  name: string;
  current_stock: number;
  unit: string;
}

const CurrentStockReport: React.FC = () => {
  const [stock, setStock] = useState<StockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStockReport = async () => {
      try {
        setLoading(true);
        const res = await axios.get<StockRecord[]>('/api/inventory/stock-report');
        setStock(res.data);
      } catch (err) {
        setError('Failed to fetch stock report.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStockReport();
  }, []);

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <h2>Current Stock Report</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Material Name</th>
            <th>Current Stock</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {stock.length > 0 ? (
            stock.map((record) => (
              <tr key={record.id}>
                <td>{record.name}</td>
                <td>{record.current_stock}</td>
                <td>{record.unit}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center">No stock data available.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default CurrentStockReport;
