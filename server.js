const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.static('public'));

let rooms = {};

app.post('/create-room', (req, res) => {
    const roomCode = uuidv4().slice(0, 5).toUpperCase();
    const pseudo = req.body.pseudo;
    rooms[roomCode] = { players: [] };
    res.json({ roomCode });
});

app.get('/room/:code', (req, res) => {
    const roomCode = req.params.code;
    if (rooms[roomCode]) {
        res.sendFile(__dirname + '/public/room.html');
    } else {
        res.status(404).send('Salon non trouvé');
    }
});

io.on('connection', (socket) => {
    let currentRoomCode = null;
    let currentPseudo = null;

    socket.on('joinRoom', (roomCode, pseudo) => {
        if (rooms[roomCode]) {
            currentRoomCode = roomCode;
            currentPseudo = pseudo;
            socket.join(roomCode);
            rooms[roomCode].players.push({ pseudo });
            socket.emit('currentPlayers', rooms[roomCode].players.map(player => player.pseudo));
            socket.to(roomCode).emit('newPlayer', pseudo);
        }
    });

    socket.on('disconnect', () => {
        if (currentRoomCode && rooms[currentRoomCode]) {
            rooms[currentRoomCode].players = rooms[currentRoomCode].players.filter(player => player.pseudo !== currentPseudo);
            if (rooms[currentRoomCode].players.length === 0) {
                delete rooms[currentRoomCode];
            } else {
                socket.to(currentRoomCode).emit('playerLeft', currentPseudo);
            }
        }
    });

    socket.on('startGame', (roomCode) => {
        io.to(roomCode).emit('gameStarted', rooms[roomCode].players);
    });
});

server.listen(3000, () => {
    console.log('Serveur démarré sur le port 3000');
});