var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var config = {
    limit: 3
};

var users = [];

server.listen(3000, function(){
  console.log('Le serveur a démarré sous *:3000');
});

app.get('/', function(request, response) {
    response.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {

    if (Object.keys(io.sockets.sockets).length > config.limit) {
        socket.emit('chat.full');
        socket.disconnect();
    }

    socket.emit('chat.username');

    socket.on('chat.new', function(username) {
        if (users.indexOf(username) === -1) {
            users.push(username);
            socket.username = username;

            io.emit('chat.new', users);
        } else {
            socket.emit('chat.wrong_username');
            socket.emit('chat.username');
        }
    })

    socket.on('chat.message', function(data) {
        io.emit('chat.message', {
            'username': socket.username,
            'message': data.message,
            'date': new Date()
        });
    });

    socket.on('disconnect', function() {
        var index = users.indexOf(socket.username);
        users.splice(index, 1);
        io.emit('chat.new', users);
    });
});