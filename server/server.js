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
                players: [{ id: socket.id, name: data.playerName, cards: generateInitialCards() }],
                deck: generateDeck(),
                discardPile: []
            };
            isCreator = true;
        } else {
            gameCode = data.gameCode;
            if (games[gameCode]) {
                games[gameCode].players.push({ id: socket.id, name: data.playerName, cards: generateInitialCards() });
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
            games[gameCode].players.push({ id: socket.id, name: data.playerName, cards: generateInitialCards() });
            socket.join(gameCode);
            socket.emit('gameJoined', { gameCode, players: games[gameCode].players });
            io.to(gameCode).emit('updateLobby', { gameCode, players: games[gameCode].players });
        } else {
            socket.emit('error', { message: 'Game not found' });
        }
    });

    socket.on('startGame', (data) => {
        const gameCode = data.gameCode;
        io.to(gameCode).emit('startGame', { players: games[gameCode].players });
    });

    socket.on('drawCard', (data) => {
        const game = games[data.gameCode];
        const player = game.players.find(p => p.id === data.playerId);
        const card = game.deck.pop();
        player.hand.push(card);
        io.to(data.gameCode).emit('gameUpdate', { players: game.players });
    });

    socket.on('discardCard', (data) => {
        const game = games[data.gameCode];
        const player = game.players.find(p => p.id === data.playerId);
        const card = player.hand.pop();
        game.discardPile.push(card);
        io.to(data.gameCode).emit('gameUpdate', { players: game.players });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

function generateInitialCards() {
    const cards = [];
    for (let i = 0; i < 12; i++) {
        cards.push({ value: Math.floor(Math.random() * 12) + 1, revealed: false });
    }
    return cards;
}

function generateDeck() {
    const deck = [];
    for (let i = 1; i <= 12; i++) {
        for (let j = 0; j < 8; j++) {
            deck.push({ value: i, revealed: false });
        }
    }
    shuffle(deck);
    return deck;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));