import React, { useState } from 'react';
import axios from 'axios';
import './AddMaterialModal.css';

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddMaterialModal: React.FC<AddMaterialModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    supplier: '',
    unit: '',
    cost_per_unit: '',
    min_stock_level: '0',
  });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post('/api/materials', {
        ...formData,
        cost_per_unit: parseFloat(formData.cost_per_unit) || 0,
        min_stock_level: parseFloat(formData.min_stock_level) || 0,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to add material. Please check the fields and try again.');
      console.error(err);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Material</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea className="form-control" id="description" name="description" value={formData.description} onChange={handleChange}></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="supplier" className="form-label">Supplier</label>
            <input type="text" className="form-control" id="supplier" name="supplier" value={formData.supplier} onChange={handleChange} />
          </div>
          <div className="row">
            <div className="col">
              <label htmlFor="unit" className="form-label">Unit</label>
              <input type="text" className="form-control" id="unit" name="unit" value={formData.unit} onChange={handleChange} required />
            </div>
            <div className="col">
              <label htmlFor="cost_per_unit" className="form-label">Cost per Unit</label>
              <input type="number" className="form-control" id="cost_per_unit" name="cost_per_unit" value={formData.cost_per_unit} onChange={handleChange} />
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Material</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaterialModal;
