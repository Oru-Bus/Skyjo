document.addEventListener('DOMContentLoaded', () => {
    const createRoomBtn = document.getElementById('createRoomBtn');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const joinRoomModal = document.getElementById('joinRoomModal');
    const closeModal = document.getElementsByClassName('close')[0];
    const submitJoinBtn = document.getElementById('submitJoinBtn');
    const roomCodeInput = document.getElementById('roomCodeInput');

    createRoomBtn.addEventListener('click', () => {
        const roomCode = generateRoomCode();
        window.location.href = `../room/room.html?code=${roomCode}`;
    });

    joinRoomBtn.addEventListener('click', () => {
        joinRoomModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        joinRoomModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === joinRoomModal) {
            joinRoomModal.style.display = 'none';
        }
    });

    submitJoinBtn.addEventListener('click', () => {
        const roomCode = roomCodeInput.value;
        if (roomCode) {
            window.location.href = `../room/room.html?code=${roomCode}`;
        } else {
            alert('Please enter a room code.');
        }
    });

    function generateRoomCode() {
        return Math.random().toString(36).substr(2, 6).toUpperCase();
    }
});