function Room(name) {
    var room_name = name;
    var messageHistory = [];
    var users = [];

    function getUsers() {
        return users;
    }

    function addUser(user) {
        users.push(user);
    }

    function removeUser(user) {
        users.splice(user, 1)
    }

    function addMessage(message) {
        if (messageHistory > 10) {
            messageHistory.shift();
            messageHistory.push(message);
        } else {
            messageHistory.push(message);
        }
    }

    function getMessages() {
        return messageHistory;
    }

    function getName() {
        return room_name;
    }

    return {
        addMessage: addMessage,
        getMessages: getMessages,
        getName: getName,
        removeUser: removeUser,
        getUsers: getUsers,
        addUser: addUser
    }

}


module.exports = Room;