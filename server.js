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
    rooms[roomCode] = { players: [{ pseudo, inGame: false }], gameStarted: false };
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

app.get('/game/:code', (req, res) => {
    const roomCode = req.params.code;
    if (rooms[roomCode]) {
        res.sendFile(__dirname + '/public/game.html');
    } else {
        res.status(404).send('Jeu non trouvé');
    }
});

io.on('connection', (socket) => {
    let currentRoomCode = null;
    let currentPseudo = null;
    let redirectedToGame = false;

    socket.on('joinRoom', (roomCode, pseudo) => {
        if (rooms[roomCode]) {
            currentRoomCode = roomCode;
            currentPseudo = pseudo;
            redirectedToGame = false;
            socket.join(roomCode);

            if (!rooms[roomCode].players.find(player => player.pseudo === pseudo)) {
                rooms[roomCode].players.push({ pseudo, inGame: false });
            }

            socket.emit('currentPlayers', rooms[roomCode].players.map(player => player.pseudo));
            socket.to(roomCode).emit('newPlayer', pseudo);
        }
    });

    socket.on('disconnect', () => {
        if (currentRoomCode && rooms[currentRoomCode] && !redirectedToGame) {
            rooms[currentRoomCode].players = rooms[currentRoomCode].players.filter(player => player.pseudo !== currentPseudo);
            console.log(`Player ${currentPseudo} left room ${currentRoomCode}`, rooms[currentRoomCode].players);
            if (rooms[currentRoomCode].players.length === 0 && !rooms[currentRoomCode].gameStarted) {
                delete rooms[currentRoomCode];
                console.log(`Room ${currentRoomCode} deleted`);
            } else {
                socket.to(currentRoomCode).emit('playerLeft', currentPseudo);
            }
        }
    });

    socket.on('startGame', (roomCode) => {
        if (rooms[roomCode]) {
            redirectedToGame = true;
            rooms[roomCode].players.forEach(player => player.inGame = true);
            rooms[roomCode].gameStarted = true;
            console.log(rooms[roomCode].players);
            io.to(roomCode).emit('gameRedirect', roomCode);
        }
    });

    socket.on('gameStarted', (roomCode) => {
        if (rooms[roomCode]) {
            console.log(rooms[roomCode].players);
            const playerPseudos = rooms[roomCode].players;
            io.to(roomCode).emit('playerPseudos', playerPseudos);
        }
    });
});

server.listen(3000, () => {
    console.log('Serveur démarré sur le port 3000');
});