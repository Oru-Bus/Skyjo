function setNickname() {
    const nickname = document.getElementById('nickname').value;
    if (nickname) {
        localStorage.setItem('nickname', nickname);
        window.location.href = '../lobby/lobby.html';
    } else {
        alert('Please enter a nickname');
    }
}