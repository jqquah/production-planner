import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Materials.css';
import AddMaterialModal from './AddMaterialModal';
import EditMaterialModal from './EditMaterialModal';

interface Material {
  id: number;
  name: string;
  description: string;
  supplier: string;
  unit: string;
  cost_per_unit: number;
  current_stock: number;
}

const Materials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Material[]>('/api/materials');
      setMaterials(res.data);
    } catch (err) {
      setError('Failed to fetch materials');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleAddSuccess = () => {
    fetchMaterials();
  };

  const handleEditClick = (material: Material) => {
    setEditingMaterial(material);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchMaterials();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await axios.delete(`/api/materials/${id}`);
        fetchMaterials(); // Refresh the list after deletion
      } catch (err) {
        setError('Failed to delete material.');
        console.error(err);
      }
    }
  };

  if (loading) return <p>Loading materials...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <h2>Raw Materials Management</h2>
      <button className="btn btn-primary mb-3" onClick={() => setIsAddModalOpen(true)}>Add New Material</button>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Supplier</th>
            <th>Unit</th>
            <th>Cost per Unit</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {materials.length > 0 ? (
            materials.map((material) => (
              <tr key={material.id}>
                <td>{material.name}</td>
                <td>{material.supplier}</td>
                <td>{material.unit}</td>
                <td>${material.cost_per_unit}</td>
                <td>{material.current_stock}</td>
                <td>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleEditClick(material)}>Edit</button>
                  <button className="btn btn-sm btn-danger ms-2" onClick={() => handleDelete(material.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center">No materials found.</td>
            </tr>
          )}
        </tbody>
      </table>
      <AddMaterialModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={handleAddSuccess} 
      />
      <EditMaterialModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        material={editingMaterial}
      />
    </div>
  );
};

export default Materials;
