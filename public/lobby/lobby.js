const socket = io();
let nickname = localStorage.getItem('nickname');

function createRoom() {
    if (nickname) {
        socket.emit('createRoom', { nickname });
    } else {
        alert('Please enter a nickname first');
        window.location.href = '/';
    }
}

function joinRoom() {
    const roomId = document.getElementById('roomId').value;
    if (nickname && roomId) {
        socket.emit('joinRoom', { roomId, nickname });
    } else {
        alert('Please enter both a nickname and a room code');
    }
}

socket.on('roomCreated', ({ roomId, nickname, owner }) => {
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('room').style.display = 'block';
    document.getElementById('room-info').textContent = `Room ID: ${roomId} - You are the owner: ${owner}`;
});

socket.on('joinedRoom', ({ roomId, nickname, owner }) => {
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('room').style.display = 'block';
    document.getElementById('room-info').textContent = `Room ID: ${roomId} - You are the owner: ${owner}`;
});

socket.on('error', (message) => {
    alert(message);
});
