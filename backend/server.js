const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: '*', // Allow all for debugging, can refine later
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/patients', require('./routes/patients'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Database Connection Test
app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT 1 + 1 AS result');
    res.json({ status: 'OK', message: 'Database connection successful', result: rows[0].result });
  } catch (error) {
    res.status(500).json({ status: 'Error', message: 'Database connection failed', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
