const mysql = require('mysql2/promise');

class Database {
    constructor() {
        this.pool = null;
    }

    async initialize() {
        try {
            this.pool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                enableKeepAlive: true,
                keepAliveInitialDelay: 0
            });

            // Test connection
            await this.pool.execute('SELECT 1');
            return true;
        } catch (error) {
            throw new Error(`Database connection failed: ${error.message}`);
        }
    }

    async getApiKey(serviceName) {
        try {
            const [rows] = await this.pool.execute(
                'SELECT api_key FROM api_keys WHERE service_name = ? AND is_active = true',
                [serviceName]
            );
            return rows.length > 0 ? rows[0].api_key : null;
        } catch (error) {
            console.error('Error fetching API key:', error);
            return null;
        }
    }

    async saveWeatherData(data) {
        const query = `
            INSERT INTO weather_history 
            (address, latitude, longitude, weather_data, forecast_data, user_ip)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        try {
            const [result] = await this.pool.execute(query, [
                data.address,
                data.latitude,
                data.longitude,
                JSON.stringify(data.weatherData),
                data.forecastData ? JSON.stringify(data.forecastData) : null,
                data.userIp || null
            ]);
            return { success: true, id: result.insertId };
        } catch (error) {
            console.error('Error saving weather data:', error);
            throw error;
        }
    }

    async getWeatherHistory(limit = 50) {
    try {
        const safeLimit = parseInt(limit, 10) || 50;

        const [rows] = await this.pool.query(
            `SELECT * FROM weather_history
             ORDER BY request_timestamp DESC
             LIMIT ${safeLimit}`
        );

        return rows.map(row => ({
            ...row,
            weather_data: typeof row.weather_data === 'string' 
                ? JSON.parse(row.weather_data) 
                : row.weather_data,
            forecast_data: row.forecast_data 
                ? (typeof row.forecast_data === 'string' 
                    ? JSON.parse(row.forecast_data) 
                    : row.forecast_data) 
                : null
        }));
    } catch (error) {
        console.error('Error fetching history:', error);
        throw error;
    }
}




    isConnected() {
        return this.pool !== null;
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
        }
    }
}

module.exports = new Database();