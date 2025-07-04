import React from 'react';
import { ProgressBar } from 'react-bootstrap';

interface StockLevelIndicatorProps {
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number; // Optional: for a more accurate percentage
}

const StockLevelIndicator: React.FC<StockLevelIndicatorProps> = ({ currentStock, minStockLevel, maxStockLevel = minStockLevel * 2 }) => {
  const getVariant = (percentage: number) => {
    if (percentage <= 50) return 'danger';
    if (percentage <= 75) return 'warning';
    return 'success';
  };

  // Ensure maxStockLevel is not zero to avoid division by zero
  const safeMaxStock = maxStockLevel > 0 ? maxStockLevel : 1;
  const percentage = Math.min((currentStock / safeMaxStock) * 100, 100);

  const variant = currentStock <= minStockLevel ? 'danger' : getVariant(percentage);

  return (
    <ProgressBar 
      now={percentage} 
      variant={variant} 
      label={`${Math.round(percentage)}%`} 
      style={{ height: '20px', fontSize: '0.75rem' }}
    />
  );
};

export default StockLevelIndicator;
