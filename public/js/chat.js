const clientSocket = io();

clientSocket.on('message', (messageData) => {
    console.log(messageData);
});

const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#userMessage');

document.querySelector('#messageForm').addEventListener('submit', (evt) => {
    clientSocket.emit('sendMessage', messageInput.value);
    evt.preventDefault();
})