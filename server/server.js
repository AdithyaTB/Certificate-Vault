const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/error.middleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/users', require('./routes/user.routes'));
app.use('/api/certificates', require('./routes/certificate.routes'));

app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/folders', require('./routes/folder.routes'));
app.use('/api/share', require('./routes/share.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/admin', require('./routes/admin.routes'));


// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
