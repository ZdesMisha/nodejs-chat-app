var express = require('express');
var ejs = require('ejs');
var http = require('http');
var Room = require("./room");


var app = express();
var server = http.createServer(app);
var io = require("socket.io")(server);


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set("view options", {layout: false});

app.use(express.static(__dirname + '/public/'));


app.get('/', function (req, res) {
    res.render('mainpage.ejs');
});


var initialRoom = new Room("Common room");
var rooms = [initialRoom];
initialRoom.addMessage({user: "SERVER", message: "Common room is started"});

function getRoomsNames() {
    var names = [];
    rooms.forEach(function (room) {
        names.push(room.getName());
    });
    return names;
}

function findRoom(name) {
    var searchedRoom = {};
    rooms.forEach(function (room) {
        if (room.getName() == name) {
            searchedRoom = room;
        }
    });
    return searchedRoom;
}

io.on('connection', function (client) {
    console.log("New client connected: ");
    console.log(client.handshake.query['name']);
    var name = client.handshake.query['name'];
    client.join(initialRoom.getName());
    initialRoom.addUser(name);
    client.emit('init', {
        rooms: getRoomsNames(),
        messages: initialRoom.getMessages(),
        users: initialRoom.getUsers(),
        currentRoom: initialRoom.getName()
    });
    io.in(initialRoom.getName()).emit('user list', {users: initialRoom.getUsers()});

    client.on('disconnect',function (data) {
        console.log('disconnected');    
    });
    
    client.on('message', function (data) {
        findRoom(data.room).addMessage({user: data.user, message: data.message});
        io.in(data.room).emit('message', {user: data.user, message: data.message})
    });

    client.on('new room', function (data) {
        console.log('Create new room');
        rooms.push(new Room(data.newRoom));
        client.emit('room created', {rooms: getRoomsNames()});
        findRoom(data.newRoom).addMessage({user: 'SERVER', message: "Room " + data.newRoom + " was created"});
        client.broadcast.emit('room created', {rooms: getRoomsNames()});
        client.emit('message', {user: 'SERVER', message: "Room " + data.newRoom + " was created"});
        client.broadcast.emit('message', {user: 'SERVER', message: "Room " + data.newRoom + " was created"});
    });

    client.on('change room', function (data) {
        console.log('change room');
        console.log(data);

        client.leave(data.oldRoom);
        findRoom(data.oldRoom).removeUser(data.name);
        client.join(data.newRoom);
        findRoom(data.newRoom).addUser(data.name);

        io.in(data.oldRoom).emit('user left', {users: findRoom(data.oldRoom).getUsers()});
        io.in(data.newRoom).emit('user joined', {users: findRoom(data.newRoom).getUsers()});

        client.emit('room changed', {newRoom: data.newRoom, messages: findRoom(data.newRoom).getMessages()})
    })

});

server.listen(3000);