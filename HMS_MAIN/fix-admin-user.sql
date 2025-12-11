-- Fix admin user role issue
-- This script ensures the admin user has the correct role

-- First, update the existing admin user if it exists
UPDATE users 
SET role = 'admin', 
    user_type_id = NULL, 
    is_active = 1
WHERE email = 'tetre0173@gmail.com';

-- If the user doesn't exist, create it
INSERT IGNORE INTO users (
    name, 
    email, 
    password, 
    role, 
    user_type_id, 
    is_active, 
    email_verified_at,
    created_at,
    updated_at
) VALUES (
    'Admin',
    'tetre0173@gmail.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    'admin',
    NULL,
    1,
    NOW(),
    NOW(),
    NOW()
);

-- Verify the admin user was created/updated correctly
SELECT id, name, email, role, user_type_id, is_active 
FROM users 
WHERE email = 'tetre0173@gmail.com';
