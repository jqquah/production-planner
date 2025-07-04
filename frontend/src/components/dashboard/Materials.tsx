import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Materials.css';
import AddMaterialModal from './AddMaterialModal';
import EditMaterialModal from './EditMaterialModal';
import AddMaterialBatchModal from './AddMaterialBatchModal';
import MaterialBatchesModal from './MaterialBatchesModal';
import StockLevelIndicator from './StockLevelIndicator';

interface Material {
  id: number;
  name: string;
  description: string;
  supplier: string;
  unit: string;
  cost_per_unit: number;
  current_stock: number;
  min_stock_level: number;
}

const Materials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [isViewBatchesModalOpen, setIsViewBatchesModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [viewingMaterial, setViewingMaterial] = useState<Material | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Material; direction: string } | null>(null);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await axios.get<any[]>('/api/materials');
      const materialsData = res.data.map(m => ({
        ...m,
        cost_per_unit: parseFloat(m.cost_per_unit),
        current_stock: parseFloat(m.current_stock),
        min_stock_level: parseFloat(m.min_stock_level),
      }));
      setMaterials(materialsData);
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

  const filteredAndSortedMaterials = React.useMemo(() => {
    let sortableItems = [...materials];
    if (searchTerm) {
      sortableItems = sortableItems.filter((material) =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        
        if (String(aValue).toLowerCase() < String(bValue).toLowerCase()) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (String(aValue).toLowerCase() > String(bValue).toLowerCase()) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [materials, searchTerm, sortConfig]);

  const requestSort = (key: keyof Material) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

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

  const handleViewBatchesClick = (material: Material) => {
    setViewingMaterial(material);
    setIsViewBatchesModalOpen(true);
  };

  if (loading) return <p>Loading materials...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <h2>Raw Materials Management</h2>
      <div className="mb-3 d-flex justify-content-between">
        <div>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>Add New Material</button>
          <button className="btn btn-success ms-2" onClick={() => setIsAddBatchModalOpen(true)}>Add Batch</button>
        </div>
        <div className="w-50">
          <input
            type="text"
            className="form-control"
            placeholder="Search materials by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th onClick={() => requestSort('name')}>Name</th>
            <th onClick={() => requestSort('supplier')}>Supplier</th>
            <th onClick={() => requestSort('unit')}>Unit</th>
            <th onClick={() => requestSort('cost_per_unit')}>Cost per Unit</th>
            <th onClick={() => requestSort('current_stock')}>Stock</th>
            <th>Stock Level</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedMaterials.length > 0 ? (
            filteredAndSortedMaterials.map((material) => (
              <tr key={material.id}>
                <td>{material.name}</td>
                <td>{material.supplier}</td>
                <td>{material.unit}</td>
                <td>${material.cost_per_unit.toFixed(2)}</td>
                <td>{material.current_stock}</td>
                <td>
                  <StockLevelIndicator 
                    currentStock={material.current_stock} 
                    minStockLevel={material.min_stock_level} 
                  />
                </td>
                <td>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleEditClick(material)}>Edit</button>
                  <button className="btn btn-sm btn-info ms-2" onClick={() => handleViewBatchesClick(material)}>View Batches</button>
                  <button className="btn btn-sm btn-danger ms-2" onClick={() => handleDelete(material.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center">No materials found.</td>
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
      <AddMaterialBatchModal
        show={isAddBatchModalOpen}
        onHide={() => setIsAddBatchModalOpen(false)}
        onBatchAdded={handleAddSuccess}
      />
      <MaterialBatchesModal
        show={isViewBatchesModalOpen}
        onHide={() => setIsViewBatchesModalOpen(false)}
        material={viewingMaterial}
      />
    </div>
  );
};

export default Materials;
