var express = require('express');
var ejs = require('ejs');
var http = require('http');
var fs = require('fs');
var Room = require("./room");
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('client-sessions');


var app = express();
var server = http.createServer(app);
var io = require("socket.io")(server);


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set("view options", {layout: false});

app.use(express.static(__dirname + '/public/'));
app.use(bodyParser.json());
app.use(session({
    cookieName: 'session',
    secret: 'random_string_goes_here',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));

var db = mongoose.connect('mongodb://localhost/chat-users');
var User = require('./mongodb/models/users.js');

// fs.readdirSync(__dirname + "/mongodb/models").forEach(function (filename) {
//     if (~filename.indexOf('.js')) {
//         require(__dirname + '/mongodb/models/' + filename);
//     }
// });

app.get('/', function (req, res) {
    if (req.session && req.session.user) { // Check if session exists
        // lookup the user in the DB by pulling their email from the session
        User.findOne({username: req.session.user.username}, function (err, user) {
            if (!user) {
                // if the user isn't found in the DB, reset the session info and
                // redirect the user to the login page
                req.session.reset();
                res.redirect('/signin');
            } else {
                // expose the user to the template
                res.locals.user = user;

                // render the dashboard page
                res.render('mainpage.ejs');
            }
        });
    } else {
        res.redirect('/signin');
    }
});

app.get('/signin', function (req, res) {
    res.render('login.ejs');
});

app.post('/login', function (req, res) {
    var username = "";
    var password = "";
    if (req.body) {
        username = req.body.username;
        password = req.body.password;
    }
    User.findOne({'username': username, 'password': password}, function (err, user) {
        if (err) {
            console.log("error occurred wile searching for user");
        } else if (user) {
            req.session.user = user;
            res.redirect("/");
        } else {
            res.writeHead(401, {'Content-Type': 'application/json'});
            res.end();
        }
    })

});

app.get('/logout', function (req, res) {
    req.session.reset();
    res.redirect('/signin');
});
app.get('/registration', function (req, res) {
    res.render('registration.ejs');
});

app.post('/register', function (req, res) {
    var username = "";
    var password = "";
    if (req.body) {
        username = req.body.username;
        password = req.body.password;
    }
    User.findOne({'username': username}, function (err, user) {
        if (err) {
            console.log("error occurred wile searching for user");
        } else if (user) {
            res.writeHead(401, {'Content-Type': 'application/json'});
            res.end();
        } else {
            var newUser = new User({username: username, password: password});
            newUser.save(function (err) {
                if (err) {
                    res.writeHead(401, {'Content-Type': 'application/json'});
                    res.end();
                } else {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end();
                }
            });
        }
    })
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

    client.on('disconnect', function (data) {
        console.log('disconnected');
    });

    client.on('message', function (data) {
        findRoom(data.room).addMessage({user: data.user, message: data.message});
        io.in(data.room).emit('message', {user: data.user, message: data.message});

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