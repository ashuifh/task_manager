const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables MUST BE TOP
dotenv.config();

require('./config/firebase'); // This initializes firebase
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Task Manager API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});