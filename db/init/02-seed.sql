-- Seed data for the Factory Production Planning System

-- Seed Users
-- Note: Passwords should be hashed in a real application. These are for demonstration.
INSERT INTO users (username, email, password_hash, role) VALUES
('prod_manager', 'manager@example.com', '$2b$10$DUMMY_HASH_REPLACE_IN_PROD_2', 'production_manager');

-- Seed Materials
INSERT INTO materials (name, description, unit, min_stock_level, current_stock) VALUES
('Whole Wheat Flour', 'High-quality whole wheat flour for baking.', 'kg', 50, 200),
('Purified Water', 'Filtered and purified water.', 'L', 100, 500),
('Active Dry Yeast', 'Standard yeast for leavening.', 'g', 1000, 5000),
('Fine Sea Salt', 'Natural sea salt for flavor.', 'g', 1000, 10000);

-- Seed Material Batches
INSERT INTO material_batches (material_id, batch_number, quantity, expiry_date)
SELECT id, 'FLOUR-2025-001', 100, '2026-01-01' FROM materials WHERE name = 'Whole Wheat Flour';

INSERT INTO material_batches (material_id, batch_number, quantity, expiry_date)
SELECT id, 'FLOUR-2025-002', 100, '2026-01-15' FROM materials WHERE name = 'Whole Wheat Flour';

INSERT INTO material_batches (material_id, batch_number, quantity)
SELECT id, 'WATER-2025-001', 500 FROM materials WHERE name = 'Purified Water';

-- Seed a Recipe
WITH user_id AS (
  SELECT id FROM users WHERE username = 'admin' LIMIT 1
),
recipe_insert AS (
  INSERT INTO recipes (name, version, description, created_by)
  VALUES ('Simple Whole Wheat Bread', '1.0', 'A basic recipe for whole wheat bread.', (SELECT id FROM user_id))
  RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, material_id, quantity, unit)
SELECT
    (SELECT id FROM recipe_insert),
    m.id,
    CASE m.name
        WHEN 'Whole Wheat Flour' THEN 500
        WHEN 'Purified Water' THEN 300
        WHEN 'Active Dry Yeast' THEN 7
        WHEN 'Fine Sea Salt' THEN 9
    END,
    CASE m.name
        WHEN 'Whole Wheat Flour' THEN 'g'
        WHEN 'Purified Water' THEN 'ml'
        WHEN 'Active Dry Yeast' THEN 'g'
        WHEN 'Fine Sea Salt' THEN 'g'
    END
FROM materials m WHERE m.name IN ('Whole Wheat Flour', 'Purified Water', 'Active Dry Yeast', 'Fine Sea Salt');

-- Seed a Production Batch
WITH user_id AS (
  SELECT id FROM users WHERE username = 'prod_manager' LIMIT 1
),
recipe_id AS (
  SELECT id FROM recipes WHERE name = 'Simple Whole Wheat Bread' AND version = '1.0' LIMIT 1
)
INSERT INTO production_batches (recipe_id, planned_quantity, status, scheduled_date, created_by)
VALUES ((SELECT id FROM recipe_id), 100, 'Pending', '2025-07-10', (SELECT id FROM user_id));
