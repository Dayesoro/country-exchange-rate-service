const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
const countryRoutes = require('./routes/countryRoutes');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());


app.use('/countries', countryRoutes);

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  
  
  await testConnection();
});