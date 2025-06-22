const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
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
