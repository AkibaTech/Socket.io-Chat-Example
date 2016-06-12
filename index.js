var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// Petite config...
var config = {
    limit: 3 // Nombre maximum de participants
};

// Stockes les utilisateurs connectés
var users = [];

// Lance l'écoute du serveur sur le port 3000
server.listen(3000, function(){
  console.log('Le serveur a démarré sous *:3000');
});

// Envoie le code client au navigateur
app.get('/', function(request, response) {
    response.sendFile(__dirname + '/index.html');
});

// Connection socket.io
io.on('connection', function(socket) {

    // Le chat est complet...
    if (Object.keys(io.sockets.sockets).length > config.limit) {
        // Envoi le message au client et le déconnecte
        socket.emit('chat.full');
        socket.disconnect();
    }

    // Envoi la demande de nom d'utilisateur
    socket.emit('chat.username');

    // Envoi l'évenement de nouvel utilisateur
    socket.on('chat.new', function(username) {
        // Le nom d'utilisateur n'est pas déjà pris
        if (users.indexOf(username) === -1) {
            users.push(username);
            socket.username = username;

            io.emit('chat.new', users);
        } else {
            socket.emit('chat.wrong_username');
            socket.emit('chat.username');
        }
    })

    // Réception d'un nouveau message
    socket.on('chat.message', function(data) {
        // On l'envoi à tout le monde
        io.emit('chat.message', {
            'username': socket.username,
            'message': data.message,
            'date': new Date()
        });
    });

    // Un gars s'est déconnecté...
    socket.on('disconnect', function() {
        // Libère son nom d'utilisateur
        var index = users.indexOf(socket.username);
        users.splice(index, 1);

        // Envoie la mise à jour des utilisateurs connectés
        io.emit('chat.new', users);
    });
});