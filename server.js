async function start (port)
{
    const express = require('express');
    const http = require('http');
    const path = require('path');
    const fs = require('fs');
    const socketio = require('socket.io');

    const app = express();
    const server = http.createServer(app);
    const io = socketio(server);

    // Serve static files from the public directory
    app.use(express.static('public', { index: false }));

    // Handle the root path
    app.get('/', (req, res) => {
        // Get the name from the query string or default to "whoever you are"
        const name = req.query.name || 'whoever you are';

        // Read and serve the index.html file with the name replaced
        fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Error reading index.html');
                return;
            }
            const responseHTML = data.replace(/\$NAME/g, name);

            res.send(responseHTML);
        });
    });

    // Handle a socket connection request from web client
    io.on('connection', (socket) => {

        console.log('New user connected');

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });


        socket.on('chat message', (msg) => {
            // Broadcast the message to all connected clients
            io.emit('chat message', msg);
        });
    });

    // Start the server
    server.listen(port, () => console.log(`Server running on port ${port}`));

    return server;
}

module.exports = start;