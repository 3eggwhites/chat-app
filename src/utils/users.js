const users = [];

const addUser = ({ id, userName, room }) => {
    // Normalize the data
    userName = userName.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!userName || !room) {
        return {
            error: 'Username and Room are required'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.userName === userName
    });

    // Validate username
    if(existingUser){
        return {
            error: 'Username is in use'
        }
    }

    // Store user
    const user = { id, userName, room };
    users.push(user);
    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id;
    });

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id;
    });

    return user;
}

const getUsersInRoom = (room) => {
    const usersInRoom = users.filter((user) => {
        return user.room === room.trim().toLowerCase();
    });
    return usersInRoom;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}