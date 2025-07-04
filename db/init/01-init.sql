-- Enum Types
CREATE TYPE user_role AS ENUM ('admin', 'production_manager', 'staff');
CREATE TYPE production_status AS ENUM ('Pending', 'In Progress', 'Completed', 'Cancelled');

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Materials Table (Raw Materials)
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    supplier VARCHAR(255),
    unit VARCHAR(50), -- e.g., kg, L, units
    cost_per_unit NUMERIC(10, 2) DEFAULT 0,
    min_stock_level NUMERIC(10, 2) DEFAULT 0,
    current_stock NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Material Batches (Specific batches of raw materials)
CREATE TABLE material_batches (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL REFERENCES materials(id),
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    price_per_unit NUMERIC(10, 2),
    sst_percentage NUMERIC(5, 2),
    total_price NUMERIC(10, 2),
    expiry_date DATE,
    received_date DATE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recipes Table
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, version)
);

-- Recipe Materials Table (Join table for Recipes and Materials)
CREATE TABLE recipe_materials (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    material_id INTEGER NOT NULL REFERENCES materials(id),
    percentage NUMERIC(5, 2) NOT NULL, -- Percentage of this material in the recipe
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT recipe_materials_recipe_id_material_id_key UNIQUE (recipe_id, material_id)
);

-- Production Batches Table
CREATE TABLE production_batches (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id),
    planned_quantity NUMERIC(10, 2) NOT NULL,
    actual_quantity NUMERIC(10, 2),
    status production_status NOT NULL DEFAULT 'Pending',
    scheduled_date DATE NOT NULL,
    completion_date DATE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Batch Materials (Join table for Production Batches and Material Batches)
CREATE TABLE batch_materials (
    id SERIAL PRIMARY KEY,
    production_batch_id INTEGER NOT NULL REFERENCES production_batches(id),
    material_batch_id INTEGER NOT NULL REFERENCES material_batches(id),
    quantity_used NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quality Checks Table
CREATE TABLE quality_checks (
    id SERIAL PRIMARY KEY,
    production_batch_id INTEGER NOT NULL REFERENCES production_batches(id),
    checked_by INTEGER REFERENCES users(id),
    status VARCHAR(50), -- e.g., 'Pass', 'Fail', 'Pending'
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory History Table
CREATE TABLE inventory_history (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL REFERENCES materials(id),
    batch_id INTEGER REFERENCES material_batches(id),
    user_id INTEGER REFERENCES users(id),
    change_type VARCHAR(50) NOT NULL, -- e.g., 'initial_stock', 'manual_adjustment', 'production_use', 'batch_addition'
    quantity_change NUMERIC(10, 2) NOT NULL,
    new_stock_level NUMERIC(10, 2) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add sample materials
INSERT INTO materials (name, description, supplier, unit, cost_per_unit, min_stock_level) VALUES 
('All-Purpose Flour', 'Standard white flour for baking.', 'King Arthur Flour', 'kg', 2.50, 10.00),
('Granulated Sugar', 'Refined white sugar.', 'Domino Sugar', 'kg', 1.50, 20.00),
('Unsalted Butter', 'Creamy unsalted butter.', 'Land O''Lakes', 'kg', 8.00, 5.00);

-- Optional: Add a default admin user for initial setup
-- For production, use a more secure method to create the first admin user
INSERT INTO users (username, email, password_hash, role) VALUES ('admin', 'admin@example.com', '$2a$10$qa7JPKorTEwH8O/4q0Uqnu.qrpJNN8R9rWZ6EdfpzP.CjrNmKT8K6', 'admin');
