const path = require('path');

// Load environment from backend/.env if present locally, or use cloud environment variables
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// Start the backend server
require('./backend/server.js');
