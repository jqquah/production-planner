CREATE TYPE user_role AS ENUM ('admin', 'production_manager', 'production_staff');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'production_staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Create a default admin user for initial setup
-- For production, use a more secure method to create the first admin user
INSERT INTO users (username, email, password_hash, role) VALUES ('admin', 'admin@example.com', '$2a$10$THIS_IS_A_DUMMY_HASH_REPLACE_IT', 'admin');
