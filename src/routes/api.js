const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');
const geocodingService = require('../services/geocodingService');
const database = require('../config/database');

// Get weather by address (supports both GET and POST for demonstration)
router.post('/weather', async (req, res) => {
    try {
        const { address } = req.body;
        
        if (!address || address.trim().length === 0) {
            return res.status(400).json({ error: 'Address is required' });
        }

        // Get coordinates from address
        const location = await geocodingService.getCoordinates(address);
        
        // Fetch weather data in parallel
        const [currentWeather, forecast] = await Promise.all([
            weatherService.getCurrentWeather(location.latitude, location.longitude),
            weatherService.getHourlyForecast(location.latitude, location.longitude)
        ]);

        const response = {
            address: location.placeName,
            coordinates: {
                latitude: location.latitude,
                longitude: location.longitude
            },
            current: currentWeather,
            forecast: forecast
        };

        res.json(response);
    } catch (error) {
        console.error('Weather API error:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to fetch weather data' 
        });
    }
});

// Save weather data to database
router.post('/weather/save', async (req, res) => {
    try {
        const { address, latitude, longitude, weatherData, forecastData } = req.body;
        
        if (!address || !latitude || !longitude || !weatherData) {
            return res.status(400).json({ error: 'Missing required data' });
        }

        const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        const result = await database.saveWeatherData({
            address,
            latitude,
            longitude,
            weatherData,
            forecastData,
            userIp
        });

        res.json({ 
            success: true, 
            message: 'Weather data saved successfully',
            id: result.id 
        });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ 
            error: 'Failed to save weather data' 
        });
    }
});

// Get weather history
router.get('/weather/history', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const history = await database.getWeatherHistory(limit);
        
        res.json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch weather history' 
        });
    }
});

// Alternative GET endpoint for weather (demonstrates multiple methods)
router.get('/weather/:address', async (req, res) => {
    try {
        const address = decodeURIComponent(req.params.address);
        
        const location = await geocodingService.getCoordinates(address);
        const currentWeather = await weatherService.getCurrentWeather(
            location.latitude, 
            location.longitude
        );

        res.json({
            address: location.placeName,
            coordinates: {
                latitude: location.latitude,
                longitude: location.longitude
            },
            current: currentWeather
        });
    } catch (error) {
        console.error('Weather GET error:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to fetch weather data' 
        });
    }
});

// Add this route to api.js for server-side rendering demonstration
router.get('/weather/view/:address', async (req, res) => {
    try {
        const address = decodeURIComponent(req.params.address);
        
        const location = await geocodingService.getCoordinates(address);
        const [currentWeather, forecast] = await Promise.all([
            weatherService.getCurrentWeather(location.latitude, location.longitude),
            weatherService.getHourlyForecast(location.latitude, location.longitude)
        ]);

        // Server-side rendering with Nunjucks
        res.render('weather.html', {
            address: location.placeName,
            data: {
                address: location.placeName,
                coordinates: {
                    latitude: location.latitude,
                    longitude: location.longitude
                },
                current: currentWeather,
                forecast: forecast
            }
        });
    } catch (error) {
        res.render('weather.html', {
            error: error.message
        });
    }
});

module.exports = router;