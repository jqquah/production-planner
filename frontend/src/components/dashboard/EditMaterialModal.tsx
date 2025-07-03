import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditMaterialModal.css';

interface Material {
  id: number;
  name: string;
  description: string;
  supplier: string;
  unit: string;
  cost_per_unit: number;
  current_stock: number;
}

interface EditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  material: Material | null;
}

const EditMaterialModal: React.FC<EditMaterialModalProps> = ({ isOpen, onClose, onSuccess, material }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    supplier: '',
    unit: '',
    cost_per_unit: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        description: material.description,
        supplier: material.supplier,
        unit: material.unit,
        cost_per_unit: String(material.cost_per_unit),
      });
    }
  }, [material]);

  if (!isOpen || !material) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.put(`/api/materials/${material.id}`, {
        ...formData,
        cost_per_unit: parseFloat(formData.cost_per_unit) || 0,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to update material. Please check the fields and try again.');
      console.error(err);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Material</h2>
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
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMaterialModal;
