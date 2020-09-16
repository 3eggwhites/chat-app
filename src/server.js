const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const Filter = require('bad-words');

const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const port = process.env.PORT;

const app = express();
app.set('view engine', 'jade');
// creating server outside the express library.
const server = http.createServer(app);
// creating a websocket server by passing the explicitly created serevr
const io = socketIO(server);

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

app.use('/', (req,res) => {
    res.render('index');
});

io.on('connection', (socket) => { // socket is an object which has information about new connections
    // socket.emit('message', generateMessage('Welcome!')); // to send information to a single connection
    // socket.broadcast.emit('message', generateMessage('A new user has joined'));

    socket.on('join', ({ userName, room}, acknowledge) => {
        
        const { error, user } = addUser({ 
            id: socket.id,  
            userName,
            room
        });

        if (error) {
            return acknowledge(error);
        }

        socket.join(user.room) // this allows to join a chatroom and also only emits events to that room only

        socket.emit('message', generateMessage(`Welcome! ${user.userName}`, 'Admin')); // to send information to a single connection
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.userName} has joined!`)); // the to function emits the event to a specific room
        io.to(user.room).emit('roomData', { 
            room: user.room,
            users: getUsersInRoom(user.room)
         });
        acknowledge();
    });

    socket.on('sendMessage', (message, acknowledge) => {
        // the acknowledge callback function is the final argument to acknowledge a message has been received by the server
        const user = getUser(socket.id);
        if (user) {
            const filter = new Filter();

            if(filter.isProfane(message)) {
                return acknowledge('Profanity is not allowed');
            }

            io.to(user.room).emit('message', generateMessage(message, user.userName));
            acknowledge();
        }
    });

    socket.on('sendLocation', (location, acknowledge) => {
        const user = getUser(socket.id);
        if (user) {
            io.to(user.room).emit('locationMessage', generateLocationMessage(
                `https://www.google.com/maps?q=${location.latitude},${location.longitude}`, user.userName));
            acknowledge();
        }
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.userName} has left!`));
            io.to(user.room).emit('roomData', { 
                room: user.room,
                users: getUsersInRoom(user.room)
             });
        }
    });

});

server.listen(port, () => {
    console.log(`App is up on port ${port}`);
});