var mongoose = require('mongoose');
var User = require('./server/mongodb/models/user.js');
var RoomModel = require('./server/mongodb/models/room.js');

module.exports = (function () {

    function establishConnection() {
        mongoose.connect('mongodb://localhost/chat-users');
    }

    function findUserByName(name, callback) {
        User.findOne({'username': name}, callback)
    }

    function checkCredentials(name, password, callback) {
        User.findOne({'username': name, 'password': password}, callback)
    }


    function saveUser(username, password, callback) {
        var newUser = new User({username: username, password: password});
        newUser.save(callback);
    }

    function getRooms() {
        return RoomModel.find({});
    }

    function saveRoom(name, callback) {
        var newUser = new User({name: name, messages: []});
        newUser.save(callback);
    }

    function saveMessages(room, messages) {

    }

    function closeConnection() {
        mongoose.disconnect();
    }

    return {
        establishConnection: establishConnection,
        closeConnection: closeConnection,
        saveMessages: saveMessages,
        saveRoom: saveRoom,
        getRooms: getRooms,
        saveUser: saveUser,
        checkCredentials: checkCredentials,
        findUserByName: findUserByName
    }
})();
