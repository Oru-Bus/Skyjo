const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const Room = require('./models/Room');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB
mongoose.connect('mongodb+srv://Orubus:fLkyXfqMjoJetmbD@cluster0.19vgps1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });

// Serve static files
app.use(express.static('public'));

// Serve the Socket.io client library
app.get('/socket.io/socket.io.js', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../node_modules/socket.io/client-dist/socket.io.js'));
});

// Routes for home and lobby
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/home/home.html'));
});

app.get('/lobby', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/lobby/lobby.html'));
});

// Handle socket connections
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('createRoom', ({ nickname }) => {
        const newRoom = new Room({
            owner: nickname,
            participants: [nickname]
        });
        newRoom.save().then(room => {
            socket.join(room._id.toString());
            io.to(socket.id).emit('roomCreated', { roomId: room._id.toString(), nickname, owner: true });
        });
    });

    socket.on('joinRoom', ({ roomId, nickname }) => {
        Room.findById(roomId).then(room => {
            if (room) {
                room.participants.push(nickname);
                room.save().then(() => {
                    socket.join(roomId);
                    io.to(socket.id).emit('joinedRoom', { roomId, nickname, owner: false });
                });
            } else {
                io.to(socket.id).emit('error', 'Room not found');
            }
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));