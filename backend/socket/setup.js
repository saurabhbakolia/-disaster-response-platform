let io = null;

/**
 * Initializes the Socket.IO server instance.
 * @param {import('socket.io').Server} server - The Socket.IO server instance.
 */
function initSocket(server) {
    io = server;
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`));
    });
    console.log('Socket.IO initialized.');
    return io;
}

/**
 * Returns the shared Socket.IO server instance.
 * @returns {import('socket.io').Server} The io instance.
 */
function getIo() {
    if (!io) {
        throw new Error('Socket.IO not initialized!');
    }
    return io;
}

module.exports = { initSocket, getIo };
