const clientSocket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { userName, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Get the height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have i scrolled

    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

// Event handlers
clientSocket.on('message', (messageData) => {

    const html = Mustache.render(messageTemplate, {
        messageData: messageData.text,
        createdAt: moment(messageData.createdAt).format('h:mm a'),
        userName: messageData.userName
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
});

clientSocket.on('locationMessage', (location) => {
    const html = Mustache.render(locationTemplate, {
        locationUrl: location.locationUrl,
        createdAt: moment(location.createdAt).format('h:mm a'),
        userName: location.userName
    });

    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
});

clientSocket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
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

clientSocket.emit('join', { userName, room }, (error) => {
    if (error) {
        alert(error);
        location.href='/';
    }
});