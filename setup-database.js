const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    let connection;
    
    try {
        // Connect without database first
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });
        
        console.log('Connected to MySQL server');
        
        // Create database
        await connection.query('CREATE DATABASE IF NOT EXISTS weather_tracker');
        console.log('Database created/verified');
        
        // Use database
        await connection.query('USE weather_tracker');
        
        // Create api_keys table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS api_keys (
                id INT AUTO_INCREMENT PRIMARY KEY,
                service_name VARCHAR(50) NOT NULL UNIQUE,
                api_key VARCHAR(255) NOT NULL,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_service_active (service_name, is_active)
            )
        `);
        console.log('api_keys table created');
        
        // Create weather_history table
        await connection.query(`
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
            )
        `);
        console.log('weather_history table created');
        
        // Insert default API keys
        await connection.query(`
            INSERT INTO api_keys (service_name, api_key) VALUES 
            ('openweathermap', 'YOUR_OPENWEATHER_API_KEY_HERE'),
            ('mapbox', 'YOUR_MAPBOX_API_KEY_HERE')
            ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
        `);
        console.log('Default API key placeholders inserted');
        
        console.log('\n Database setup complete');
        console.log('\n Please rememberr to update the API keys in the database with your actual keys:');
        console.log('   UPDATE api_keys SET api_key = "YOUR_ACTUAL_KEY" WHERE service_name = "openweathermap";');
        console.log('   UPDATE api_keys SET api_key = "YOUR_ACTUAL_KEY" WHERE service_name = "mapbox";');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.log('\nTroubleshooting tips:');
        console.log('1. Make sure MySQL is running');
        console.log('2. Check your .env file has correct credentials');
        console.log('3. Verify your MySQL user has CREATE DATABASE privileges');
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase();