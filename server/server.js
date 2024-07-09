const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, '../public')));

let games = {};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('createOrJoinGame', (data) => {
        let gameCode;
        let isCreator = false;

        if (!data.gameCode) {
            gameCode = Math.random().toString(36).substr(2, 5).toUpperCase();
            games[gameCode] = {
                players: [{ id: socket.id, name: data.playerName}],
                discardPile: []
            };
            isCreator = true;
        } else {
            gameCode = data.gameCode;
            if (games[gameCode]) {
                games[gameCode].players.push({ id: socket.id, name: data.playerName});
            } else {
                socket.emit('error', { message: 'Game not found' });
                return;
            }
        }

        socket.join(gameCode);
        socket.emit(isCreator ? 'gameCreated' : 'gameJoined', { gameCode, players: games[gameCode].players });
        io.to(gameCode).emit('updateLobby', { gameCode, players: games[gameCode].players });
    });

    socket.on('joinGame', (data) => {
        const gameCode = data.gameCode;
        if (games[gameCode]) {
            games[gameCode].players.push({ id: socket.id, name: data.playerName});
            socket.join(gameCode);
            socket.emit('gameJoined', { gameCode, players: games[gameCode].players });
            io.to(gameCode).emit('updateLobby', { gameCode, players: games[gameCode].players });
        } else {
            socket.emit('error', { message: 'Game not found' });
        }
    });

    socket.on('startGame', (data) => {
        const gameCode = data.gameCode;
        io.to(gameCode).emit('startGame');
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');

        for (let gameCode in games) {
            const game = games[gameCode];
            const playerIndex = game.players.findIndex(player => player.id === socket.id);
            if (playerIndex !== -1) {
                game.players.splice(playerIndex, 1);
                io.to(gameCode).emit('updateLobby', { gameCode, players: game.players });

                if (game.players.length === 0) {
                    delete games[gameCode];
                }
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
