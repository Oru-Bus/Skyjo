document.getElementById('createRoom').addEventListener('click', () => {
    const pseudo = document.getElementById('pseudo').value;
    if (pseudo) {
        fetch('/create-room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pseudo })
        }).then(response => response.json())
          .then(data => {
              window.location.href = `./room/${data.roomCode}?pseudo=${pseudo}`;
          });
    } else {
        alert('Veuillez entrer un pseudo');
    }
});

document.getElementById('joinRoom').addEventListener('click', () => {
    const pseudo = document.getElementById('pseudo').value;
    const roomCode = document.getElementById('roomCode').value;
    if (pseudo && roomCode) {
        window.location.href = `./room/${roomCode}?pseudo=${pseudo}`;
    } else {
        alert('Veuillez entrer un pseudo et un code de salon');
    }
});