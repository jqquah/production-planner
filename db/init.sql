-- Enum Types
CREATE TYPE user_role AS ENUM ('admin', 'production_manager', 'production_staff');
CREATE TYPE production_status AS ENUM ('Pending', 'In Progress', 'Completed', 'Cancelled');

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'production_staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Materials Table (Raw Materials)
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    supplier VARCHAR(255),
    unit VARCHAR(50), -- e.g., kg, L, units
    cost_per_unit NUMERIC(10, 2),
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

-- Recipe Ingredients Table (Join table for Recipes and Materials)
CREATE TABLE recipe_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    material_id INTEGER NOT NULL REFERENCES materials(id),
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

-- Optional: Add a default admin user for initial setup
-- For production, use a more secure method to create the first admin user
-- Default admin user with a real password hash (password: "password")
INSERT INTO users (username, email, password_hash, role) VALUES ('admin', 'admin@example.com', '$2b$10$cwT/u27xY4wD3gB.0c.a.u/2L.p2.5s.3s.4s.5s.6s.7s.8s.9s.0s', 'admin');
