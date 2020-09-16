const generateMessage = (text, userName) => {
    return {
        text,
        createdAt: new Date().getTime(),
        userName
    }
}

const generateLocationMessage = (locationUrl, userName) => {
    return {
        locationUrl,
        createdAt: new Date().getTime(),
        userName
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}