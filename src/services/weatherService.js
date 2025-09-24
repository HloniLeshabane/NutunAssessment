const axios = require('axios');
const database = require('../config/database');

class WeatherService {
    async getCurrentWeather(lat, lon) {
        try {
            const apiKey = await database.getApiKey('openweathermap');
            if (!apiKey) {
                throw new Error('OpenWeatherMap API key not found in database');
            }

            const response = await axios.get(
                'https://api.openweathermap.org/data/2.5/weather',
                {
                    params: {
                        lat,
                        lon,
                        appid: apiKey,
                        units: 'metric'
                    },
                    timeout: 5000
                }
            );

            return this.formatWeatherData(response.data);
        } catch (error) {
            if (error.response) {
                throw new Error(`Weather API error: ${error.response.status}`);
            }
            throw error;
        }
    }

    async getHourlyForecast(lat, lon) {
        try {
            const apiKey = await database.getApiKey('openweathermap');
            if (!apiKey) {
                throw new Error('OpenWeatherMap API key not found in database');
            }

            const response = await axios.get(
                'https://api.openweathermap.org/data/2.5/forecast',
                {
                    params: {
                        lat,
                        lon,
                        appid: apiKey,
                        units: 'metric',
                        cnt: 8  // Next 24 hours (3-hour intervals)
                    },
                    timeout: 5000
                }
            );

            return this.formatForecastData(response.data);
        } catch (error) {
            if (error.response) {
                throw new Error(`Forecast API error: ${error.response.status}`);
            }
            throw error;
        }
    }

    formatWeatherData(data) {
        return {
            temperature: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            wind_speed: data.wind.speed,
            wind_deg: data.wind.deg,
            clouds: data.clouds.all,
            visibility: data.visibility,
            sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
            sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
            dt: data.dt,
            timezone: data.timezone
        };
    }

    formatForecastData(data) {
        return data.list.map(item => ({
            dt: item.dt,
            time: new Date(item.dt * 1000).toLocaleTimeString(),
            temperature: Math.round(item.main.temp),
            feels_like: Math.round(item.main.feels_like),
            humidity: item.main.humidity,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            wind_speed: item.wind.speed,
            pop: Math.round((item.pop || 0) * 100) // Probability of precipitation
        }));
    }
}

module.exports = new WeatherService();