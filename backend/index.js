const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initSocket } = require('./socket/setup');
const { startMockStream } = require('./services/socialMediaMock');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Initialize Socket.IO and pass the instance
initSocket(io);

app.use(cors());
app.use(express.json());

// --- Security Middleware ---
// Apply a global rate limiter to all requests to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter); // Apply the limiter only to API routes

app.get('/', (req, res) => res.send('API is running 🚨'));

// Mount routes according to the spec
app.use('/api/disasters', require('./routes/disasters'));
app.use('/api/geocode', require('./routes/geocode'));
app.use('/api/resources', require('./routes/resources')); // For general resource queries like "nearby"
app.use('/api/updates', require('./routes/updates'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    // Start the mock social media stream after the server starts
    startMockStream();
});
