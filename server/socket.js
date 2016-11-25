/**
 * Created by misha on 25.11.16.
 */
module.exports = function (client) {
    
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

};