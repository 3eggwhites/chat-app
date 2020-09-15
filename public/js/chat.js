const clientSocket = io();

// Elements
const $messageForm = document.querySelector('#messageForm');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#sendLocation');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

// Event handlers
clientSocket.on('message', (messageData) => {

    const html = Mustache.render(messageTemplate, {
        messageData: messageData.text,
        createdAt: moment(messageData.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML("beforeend", html);
});

clientSocket.on('locationMessage', (location) => {
    const html = Mustache.render(locationTemplate, {
        locationUrl: location.locationUrl,
        createdAt: moment(location.createdAt).format('h:mm a')
    });

    $messages.insertAdjacentHTML("beforeend", html);
});

$messageForm.addEventListener('submit', (evt) => {

    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = evt.target.elements.message.value;
    clientSocket.emit('sendMessage', message, (error) => {

        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        // the last and final callback function is used for acknowledgement, it can or can not have parameters
        if (error) {
            return console.log(error);
        }

        console.log('Message Delivered');
    });
    evt.preventDefault();
});

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Location not supported');
    }
    $sendLocationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition(({ coords } = {}) => {
        if (!coords) {
            return alert('Location access denied');
        }
        $sendLocationButton.removeAttribute('disabled');
        clientSocket.emit('sendLocation', {
            latitude: coords.latitude,
            longitude: coords.longitude
        }, () => {
            console.log('Location Shared');
            $sendLocationButton.removeAttribute('disabled');
        });
    });
});