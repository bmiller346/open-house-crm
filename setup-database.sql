-- Database setup script for Open House CRM
-- Run this with: psql -U postgres -f setup-database.sql

-- Set new password for postgres user
ALTER USER postgres WITH PASSWORD '2fa7c866391e47a79323e9c50dba24693796';

-- Create database
DROP DATABASE IF EXISTS openhousecrm;
CREATE DATABASE openhousecrm;

-- Create application user
DROP USER IF EXISTS openhouse_user;
CREATE USER openhouse_user WITH PASSWORD 'd794e676d084477ca200bdf06b3b28463745';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE openhousecrm TO openhouse_user;

-- Connect to the new database and grant schema privileges
\c openhousecrm;
GRANT ALL ON SCHEMA public TO openhouse_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO openhouse_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO openhouse_user;

-- Display success message
SELECT 'Database setup completed successfully!' AS status;
