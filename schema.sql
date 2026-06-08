-- Cultural Council Asset Management System - Database Schema Export
-- Targeted Engine: PostgreSQL

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'consumer' CHECK (role IN ('admin', 'consumer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ASSETS TABLE
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    quantity_available INT NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    asset_id INT REFERENCES assets(id) ON DELETE CASCADE,
    quantity_requested INT NOT NULL CHECK (quantity_requested > 0),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. AUTOMATED INVENTORY TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION adjust_asset_stock_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
        UPDATE assets
        SET quantity_available = quantity_available - NEW.quantity_requested
        WHERE id = NEW.asset_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. BIND TRIGGER TO BOOKINGS
DROP TRIGGER IF EXISTS trg_adjust_asset_stock ON bookings;
CREATE TRIGGER trg_adjust_asset_stock
AFTER UPDATE OF status ON bookings
FOR EACH ROW
EXECUTE FUNCTION adjust_asset_stock_on_approval();