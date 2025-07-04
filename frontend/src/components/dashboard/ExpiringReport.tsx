import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Form } from 'react-bootstrap';

interface ExpiringBatch {
  id: number;
  material_name: string;
  batch_number: string;
  quantity: number;
  expiry_date: string;
}

const ExpiringReport: React.FC = () => {
  const [reportData, setReportData] = useState<ExpiringBatch[]>([]);
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get<ExpiringBatch[]>(`/api/inventory/expiring-report?days=${days}`);
        setReportData(res.data);
      } catch (err) {
        setError('Failed to fetch expiring materials report.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchReport();
  }, [days]);

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setDays(value);
    }
  };

  return (
    <div>
      <h2>Expiring Materials Report</h2>
      <Form className="mb-3">
        <Form.Group controlId="daysInput">
          <Form.Label>Show materials expiring in the next (days):</Form.Label>
          <Form.Control
            type="number"
            value={days}
            onChange={handleDaysChange}
            style={{ width: '100px' }}
          />
        </Form.Group>
      </Form>

      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Material Name</th>
            <th>Batch Number</th>
            <th>Quantity on Hand</th>
            <th>Expiry Date</th>
          </tr>
        </thead>
        <tbody>
          {reportData.length > 0 ? (
            reportData.map((item) => (
              <tr key={item.id}>
                <td>{item.material_name}</td>
                <td>{item.batch_number}</td>
                <td>{item.quantity}</td>
                <td>{new Date(item.expiry_date).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center">No materials expiring within the selected period.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ExpiringReport;
