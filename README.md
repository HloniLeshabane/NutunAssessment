# Weather Tracker

Weather Tracker is a full-stack web application built with Node.js and Express. It provides real-time weather information and a 24-hour forecast for any location, using data from the OpenWeatherMap and Mapbox APIs. The application also saves a history of all weather searches to a MySQL database.

## Features

- **Search Functionality**: Get current weather and a 24-hour forecast by entering a city, address, or landmark
- **Historical Data**: View a history of past weather searches, including the date, time, and weather details
- **Secure API Key Management**: API keys are stored in a MySQL database, not hardcoded in the source code
- **Modular Architecture**: The project uses a clear separation of concerns, with dedicated services for geocoding and weather data, and a separate class for all database interactions
- **Responsive Design**: The front end is built with HTML and Bootstrap 4, ensuring a clean and mobile-friendly user experience

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL (using mysql2/promise for asynchronous queries)
- **Templating**: Nunjucks
- **API Integrations**: OpenWeatherMap API, Mapbox Geocoding API
- **Dependency Management**: npm
- **Client-Side**: HTML, CSS, JavaScript, Bootstrap 4, jQuery, Font Awesome

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- MySQL Server
- An API key from [OpenWeatherMap](https://openweathermap.org/api)
- An API key from [Mapbox](https://www.mapbox.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [your-repo-url]
   cd weather-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your MySQL database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=weather_tracker
   ```

4. **Set up the Database:**
   Run the setup script to create the necessary tables and API key placeholders:
   ```bash
   npm run setup-db
   ```

5. **Update API Keys:**
   Access your MySQL database and update the `api_keys` table with your actual keys from OpenWeatherMap and Mapbox:
   ```sql
   USE weather_tracker;
   
   UPDATE api_keys SET api_key = 'YOUR_OPENWEATHER_API_KEY_HERE' WHERE service_name = 'openweathermap';
   UPDATE api_keys SET api_key = 'YOUR_MAPBOX_API_KEY_HERE' WHERE service_name = 'mapbox';
   ```

## Running the Application

1. **Start the application:**
   ```bash
   npm start
   ```
   
   The application will be accessible at `http://localhost:3000`.

2. **Run in development mode** (with live reload):
   ```bash
   npm run dev
   ```

## Project Structure

```
weather-tracker/
├── public/             # Static files (CSS, JS, images)
├── views/              # Nunjucks templates
├── services/           # API service modules
├── database/           # Database connection and queries
├── routes/             # Express routes
├── .env                # Environment variables (not tracked in git)
├── package.json        # Project dependencies and scripts
└── README.md           # This file
```

## API Endpoints

- `GET /` - Main page with search form and history
- `POST /weather` - Get weather data for a location
- `GET /history` - View search history

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue on the repository.