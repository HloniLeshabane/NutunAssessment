const axios = require('axios');
const database = require('../config/database');

class GeocodingService {
    async getCoordinates(address) {
        try {
            const apiKey = await database.getApiKey('mapbox');
            if (!apiKey) {
                throw new Error('MapBox API key not found in database');
            }

            const response = await axios.get(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
                {
                    params: {
                        access_token: apiKey,
                        limit: 1
                    },
                    timeout: 5000
                }
            );

            if (!response.data.features || response.data.features.length === 0) {
                throw new Error('Location not found');
            }

            const feature = response.data.features[0];
            return {
                latitude: feature.center[1],
                longitude: feature.center[0],
                placeName: feature.place_name
            };
        } catch (error) {
            if (error.response) {
                throw new Error(`Geocoding API error: ${error.response.status}`);
            }
            throw error;
        }
    }
}

module.exports = new GeocodingService();