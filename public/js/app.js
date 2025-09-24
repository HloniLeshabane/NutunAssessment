$(document).ready(function() {
    let currentWeatherData = null;
    let currentForecastData = null;
    let currentLocation = null;

    // Initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();

    // Weather form submission (using fetch API)
    $('#weatherForm').on('submit', async function(e) {
        e.preventDefault();
        const address = $('#addressInput').val().trim();
        
        if (!address) {
            showError('Please enter an address');
            return;
        }

        await fetchWeatherData(address);
    });

    // Fetch weather data
    async function fetchWeatherData(address) {
        showLoading(true);
        hideAlerts();
        
        try {
            const response = await fetch('/api/weather', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ address })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch weather');
            }

            const data = await response.json();
            currentWeatherData = data.current;
            currentForecastData = data.forecast;
            currentLocation = {
                address: data.address,
                latitude: data.coordinates.latitude,
                longitude: data.coordinates.longitude
            };

            displayWeatherData(data);
            $('#saveBtn').prop('disabled', false);
            
        } catch (error) {
            showError(error.message);
            $('#saveBtn').prop('disabled', true);
        } finally {
            showLoading(false);
        }
    }

    // Display weather data with dynamic HTML creation
    function displayWeatherData(data) {
        // Clear containers
        $('#currentWeatherContainer').empty();
        $('#forecastContainer').empty();
        $('#historyContainer').empty();

        // Create current weather card
        const weatherCard = createWeatherCard(data);
        $('#currentWeatherContainer').html(weatherCard);

        // Create forecast cards
        if (data.forecast && data.forecast.length > 0) {
            const forecastCards = createForecastCards(data.forecast);
            $('#forecastContainer').html(forecastCards);
        }

        // Animate cards
        $('.weather-card').addClass('animate-in');
    }

    // Create weather card HTML
    function createWeatherCard(data) {
        const weather = data.current;
        const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
        
        return `
            <div class="card weather-card shadow mb-4">
                <div class="card-header bg-primary text-white">
                    <h4><i class="fas fa-map-marker-alt"></i> ${data.address}</h4>
                    <small>Lat: ${data.coordinates.latitude}, 
                           Lon: ${data.coordinates.longitude}</small>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4 text-center">
                            <img src="${iconUrl}" alt="${weather.description}" class="weather-icon">
                            <h2 class="display-4">${weather.temperature}°C</h2>
                            <p class="text-capitalize">${weather.description}</p>
                        </div>
                        <div class="col-md-8">
                            <div class="row">
                                <div class="col-6">
                                    <p><i class="fas fa-thermometer-half text-danger"></i> 
                                       Feels like: <strong>${weather.feels_like}°C</strong></p>
                                    <p><i class="fas fa-tint text-info"></i> 
                                       Humidity: <strong>${weather.humidity}%</strong></p>
                                    <p><i class="fas fa-wind text-primary"></i> 
                                       Wind: <strong>${weather.wind_speed} m/s</strong></p>
                                </div>
                                <div class="col-6">
                                    <p><i class="fas fa-compress text-secondary"></i> 
                                       Pressure: <strong>${weather.pressure} hPa</strong></p>
                                    <p><i class="fas fa-cloud text-muted"></i> 
                                       Cloudiness: <strong>${weather.clouds}%</strong></p>
                                    <p><i class="fas fa-eye"></i> 
                                       Visibility: <strong>${(weather.visibility/1000)} km</strong></p>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-6">
                                    <p><i class="fas fa-sun text-warning"></i> 
                                       Sunrise: <strong>${weather.sunrise}</strong></p>
                                </div>
                                <div class="col-6">
                                    <p><i class="fas fa-moon text-dark"></i> 
                                       Sunset: <strong>${weather.sunset}</strong></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Create forecast cards
    function createForecastCards(forecast) {
        let html = '<h4 class="mb-3">24-Hour Forecast</h4><div class="row">';
        
        forecast.forEach((item, index) => {
            if (index < 8) { // Show 8 3-hour intervals
                const iconUrl = `https://openweathermap.org/img/wn/${item.icon}.png`;
                html += `
                    <div class="col-lg-3 col-md-4 col-sm-6 mb-3">
                        <div class="card forecast-card h-100">
                            <div class="card-body text-center">
                                <p class="mb-1"><small>${item.time}</small></p>
                                <img src="${iconUrl}" alt="${item.description}" width="50">
                                <p class="mb-1"><strong>${item.temperature}°C</strong></p>
                                <p class="mb-1 small text-capitalize">${item.description}</p>
                                <p class="mb-0 small">
                                    <i class="fas fa-tint"></i> ${item.humidity}% 
                                    <i class="fas fa-wind ml-2"></i> ${item.wind_speed}m/s
                                </p>
                                ${item.pop > 0 ? `<p class="mb-0 small"><i class="fas fa-umbrella"></i> ${item.pop}%</p>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        return html;
    }

    // Save weather data
    $('#saveBtn').on('click', async function() {
        if (!currentWeatherData || !currentLocation) {
            showError('No weather data to save');
            return;
        }

        try {
            const response = await fetch('/api/weather/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    address: currentLocation.address,
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    weatherData: currentWeatherData,
                    forecastData: currentForecastData
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save weather data');
            }

            showSuccess('Weather data saved successfully!');
            $('#saveBtn').prop('disabled', true);
            
        } catch (error) {
            showError(error.message);
        }
    });

    // Show history (using jQuery AJAX for variety)
    $('#historyBtn').on('click', function() {
        showLoading(true);
        hideAlerts();
        
        $.ajax({
            url: '/api/weather/history',
            method: 'GET',
            success: function(response) {
                displayHistory(response.data);
                showLoading(false);
            },
            error: function(xhr) {
                showError('Failed to load history');
                showLoading(false);
            }
        });
    });

    // Display history with dynamic HTML
    function displayHistory(history) {
        $('#currentWeatherContainer').empty();
        $('#forecastContainer').empty();
        
        let html = '<h4 class="mb-3">Weather History</h4>';
        
        if (history.length === 0) {
            html += '<p class="text-muted">No weather history found.</p>';
        } else {
            html += '<div class="table-responsive"><table class="table table-striped">';
            html += '<thead><tr><th>Date/Time</th><th>Location</th><th>Temperature</th><th>Description</th><th>Actions</th></tr></thead>';
            html += '<tbody>';
            
            history.forEach((item, index) => {
                const date = new Date(item.request_timestamp).toLocaleString();
                const weather = item.weather_data;
                
                html += `
                    <tr>
                        <td>${date}</td>
                        <td>${item.address}</td>
                        <td>${weather.temperature}°C</td>
                        <td class="text-capitalize">${weather.description}</td>
                        <td>
                            <button class="btn btn-sm btn-info view-history" 
                                    data-index="${index}">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            html += '</tbody></table></div>';
        }
        
        $('#historyContainer').html(html);
        
        // Attach event handlers for view buttons
        $('.view-history').on('click', function() {
            const index = $(this).data('index');
            const item = history[index];
            displayHistoryItem(item);
        });



    }

    // Display individual history item
    function displayHistoryItem(item) {
        const data = {
            address: item.address,
            coordinates: {
                latitude: item.latitude,
                longitude: item.longitude
            },
            current: item.weather_data,
            forecast: item.forecast_data ? item.forecast_data : []
        };
        
        displayWeatherData(data);
        showSuccess(`Showing weather from ${new Date(item.request_timestamp).toLocaleString()}`);
    }

    // Clear display
    $('#clearBtn').on('click', function() {
        $('#currentWeatherContainer').empty();
        $('#forecastContainer').empty();
        $('#historyContainer').empty();
        $('#addressInput').val('');
        $('#saveBtn').prop('disabled', true);
        hideAlerts();
        currentWeatherData = null;
        currentForecastData = null;
        currentLocation = null;
    });

    // Helper functions
    function showLoading(show) {
        if (show) {
            $('#loadingIndicator').removeClass('d-none');
        } else {
            $('#loadingIndicator').addClass('d-none');
        }
    }

    function showError(message) {
        $('#errorMessage').text(message);
        $('#errorAlert').removeClass('d-none');
        setTimeout(hideAlerts, 5000);
    }

    function showSuccess(message) {
        $('#successMessage').text(message);
        $('#successAlert').removeClass('d-none');
        setTimeout(hideAlerts, 5000);
    }

    function hideAlerts() {
        $('#errorAlert').addClass('d-none');
        $('#successAlert').addClass('d-none');
    }
});