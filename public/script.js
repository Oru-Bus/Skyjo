const socket = io();

let gameCode;
let playerName;
let isGameCreator = false;

window.onload = function() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('pseudo')) {
        playerName = params.get('pseudo');
        if (params.has('gameCode')) {
            gameCode = params.get('gameCode');
            socket.emit('joinGame', { gameCode, playerName });
        } else {
            socket.emit('createOrJoinGame', { playerName });
        }
    }
}

socket.on('gameCreated', (data) => {
    gameCode = data.gameCode;
    isGameCreator = true;
    document.getElementById('gameLink').innerText = `Share this link to invite others: ${window.location.origin}/lobby.html?gameCode=${gameCode}`;
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
    window.location.href = `game.html?gameCode=${gameCode}&pseudo=${playerName}`;
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