'user strict';
angular.module('chat', ['btford.socket-io', 'cgPrompt'])


    .controller('ChatController',
        ['$scope', '$timeout', '$http', 'prompt', 'socketService', function ($scope, $timeout, $http, prompt, socketService) {
            $scope.name = "";
            $scope.rooms = [];
            $scope.messages = [];
            $scope.newMessage = "";
            $scope.newRoom = "";
            $scope.currentRoom = "";
            $scope.users = [];
            $scope.socket = "";

            //todo something with it
            $scope.socket = socketService.setupConnection("Misha");
            $scope.name = "Misha";
            setupListeners();

            $scope.sendMessage = function () {
                console.log('create new message');
                $scope.socket.emit('message', {
                    user: $scope.name,
                    message: $scope.newMessage,
                    room: $scope.currentRoom
                });
            };

            $scope.logout = function () {
                $http.get('/logout');
            };


            $scope.createRoom = function () {
                console.log('create new room');
                $scope.socket.emit('new room', {newRoom: $scope.newRoom});
            };

            $scope.changeRoom = function (room) {
                console.log('change room to ');
                console.log(room);
                $scope.socket.emit('change room', {newRoom: room, oldRoom: $scope.currentRoom, name: $scope.name});
            };

            function setupListeners() {

                $scope.socket.on('init', function (data) {
                    console.log(data);
                    $scope.rooms = data.rooms;
                    $scope.messages = data.messages;
                    $scope.users = data.users;
                    $scope.currentRoom = data.currentRoom
                });


                $scope.socket.on('disconnect', function () {
                    console.log($scope.name + " disconnected");
                });


                $scope.socket.on('message', function (data) {
                    $scope.messages.push(data)
                });

                $scope.socket.on('user list', function (data) {
                    console.log('refresh user list');
                    $scope.users = data.users;
                });

                $scope.socket.on('room created', function (data) {
                    console.log("room created!");
                    $scope.rooms = data.rooms;
                });

                $scope.socket.on('room changed', function (data) {
                    console.log("room changed!");
                    $scope.currentRoom = data.newRoom;
                    $scope.messages = data.messages;
                });

                $scope.socket.on('user left', function (data) {
                    console.log("user left!");
                    $scope.users = data.users;
                });
                $scope.socket.on('user joined', function (data) {
                    console.log("user joined!");
                    $scope.users = data.users;
                });
            }

        }])

    .factory('socket', function (socketFactory) {
        // console.log('initialize socket factory');
        // var myIoSocket = io.connect('localhost:3000');
        // return socketFactory({
        //     ioSocket: myIoSocket
        // });
    })

    .factory('socketService', function (socketFactory) {
        function setupConnection(name) {
            console.log('initialize socket factory 2');
            return socketFactory({
                ioSocket: io.connect('localhost:3000', {
                    query: "name=" + name,
                    reconnection: false
                })
            });
        }

        return {
            setupConnection: setupConnection
        }

    })


    .factory('DialogService', function ($http) {


    })


    .directive('chat', function () {
        return {
            restrict: "E",
            templateUrl: 'js/chat/chat.template.html',
            controller: 'ChatController'
        }
    });


