const socket = io();

let gameCode;
let playerName;
let playerId;
let isGameCreator = false;

window.onload = function() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('pseudo')) {
        playerName = params.get('pseudo');
        socket.emit('createOrJoinGame', { playerName });
    }

    if (params.has('gameCode')) {
        gameCode = params.get('gameCode');
        playerName = params.get('pseudo');
        socket.emit('joinGame', { gameCode, playerName });
    }
}

socket.on('gameCreated', (data) => {
    gameCode = data.gameCode;
    isGameCreator = true;
    document.getElementById('gameLink').innerText = `Share this link to invite others: ${window.location.origin}/lobby.html?gameCode=${gameCode}&pseudo=${playerName}`;
    updateLobby(data);
});

socket.on('gameJoined', (data) => {
    gameCode = data.gameCode;
    updateLobby(data);
});

socket.on('updateLobby', (data) => {
    updateLobby(data);
});

socket.on('startGame', (data) => {
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('gameBoard').style.display = 'block';
    updateGameBoard(data);
});

function updateLobby(data) {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';
    data.players.forEach(player => {
        const li = document.createElement('li');
        li.innerText = player.name;
        playersList.appendChild(li);
    });

    if (data.players.length >= 2 && isGameCreator) {
        document.getElementById('startGameButton').disabled = false;
    }
}

function startGame() {
    socket.emit('startGame', { gameCode });
}

function updateGameBoard(data) {
    const playersHands = document.getElementById('playersHands');
    playersHands.innerHTML = '';
    data.players.forEach(player => {
        const playerHand = document.createElement('div');
        playerHand.className = 'playerHand';
        playerHand.innerHTML = `<h3>${player.name}</h3>`;
        player.cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.innerText = card.revealed ? card.value : '?';
            playerHand.appendChild(cardElement);
        });
        playersHands.appendChild(playerHand);
    });
}

function drawCard() {
    socket.emit('drawCard', { gameCode, playerId });
}

function discardCard() {
    socket.emit('discardCard', { gameCode, playerId });
}