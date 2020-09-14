const clientSocket = io();

clientSocket.on('message', (messageData) => {
    console.log(messageData);
});

const messageForm = document.querySelector('#messageForm');

document.querySelector('#messageForm').addEventListener('submit', (evt) => {
    const message = evt.target.elements.message.value;
    clientSocket.emit('sendMessage', message);
    evt.preventDefault();
});

document.querySelector('#sendLocation').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Location not supported');
    }
    navigator.geolocation.getCurrentPosition(({ coords } = {}) => {
        if (!coords) {
            return alert('Location access denied');
        }
        clientSocket.emit('sendLocation', {
            latitude: coords.latitude,
            longitude: coords.longitude
        });
    });
});