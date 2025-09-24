-- Create database
CREATE DATABASE IF NOT EXISTS weather_tracker;
USE weather_tracker;

-- API Keys table (as per requirement)
CREATE TABLE IF NOT EXISTS api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL UNIQUE,
    api_key VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service_active (service_name, is_active)
);

-- Weather requests history table
CREATE TABLE IF NOT EXISTS weather_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    weather_data JSON NOT NULL,
    forecast_data JSON,
    request_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_ip VARCHAR(45),
    INDEX idx_timestamp (request_timestamp),
    INDEX idx_coordinates (latitude, longitude),
    INDEX idx_address (address)
);

-- Insert placeholder API keys (users will update with their own)
INSERT INTO api_keys (service_name, api_key) VALUES 
('openweathermap', 'YOUR_OPENWEATHER_API_KEY_HERE'),
('mapbox', 'YOUR_MAPBOX_API_KEY_HERE')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Sample query to verify installation
SELECT 'Database setup complete!' as message;