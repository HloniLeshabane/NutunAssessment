require('dotenv').config();
const express = require('express');
const nunjucks = require('nunjucks');
const path = require('path');
const apiRoutes = require('./routes/api');
const database = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Nunjucks templating engine
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: process.env.NODE_ENV === 'development'
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Log requests in development
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        database: database.isConnected() ? 'connected' : 'disconnected'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'Internal server error'
    });
});

// Initialize database and start server
async function startServer() {
    try {
        await database.initialize();
        console.log('✅ Database connected successfully');
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();