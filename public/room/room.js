document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('code');
    const roomCodeElement = document.getElementById('roomCode');
    const userListElement = document.getElementById('userList');

    roomCodeElement.textContent = roomCode;

    // In a real application, you'd connect to a server or use WebSocket to manage users
    const users = ['User1', 'User2']; // Example users

    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        userListElement.appendChild(li);
    });
});
