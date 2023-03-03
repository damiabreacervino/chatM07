const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
let i = 0;
let users = [];

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});

io.on('connection', (socket) => {
    console.log('new conexion:  user ' + i + ' connected');

    socket.nom = i;
    i++;

    socket.broadcast.emit('user ' + socket.nom + ' => hi');

    socket.on('disconnect', () => {
        for (let i = 0; i < users.length; i++) {
            if (socket.user == [users[i].username]) {
                users.splice(i, 1);
            }
        }
        console.log('user ' + socket.user + ' disconnected');
        io.emit('users', users);
    });
});

io.on('connection', (socket) => {
    socket.on('user', (user) => {
        socket.user = user;
        users.push({ username: socket.user, id: socket.id });
        io.emit('users', users);
    });

    socket.on('offerToken', (token, username, initUsername) => {
        let receptor;

        for (let i = 0; i < users.length; i++) {
            if (username == users[i].username) {
                receptor = users[i].id;
                i = users.length;
            }
        }

        io.to(receptor).emit('offerToken', token, initUsername);
    });

    socket.on('answerToken', (token, username) => {
        let receptor;

        for (let i = 0; i < users.length; i++) {
            if (username == users[i].username) {
                receptor = users[i].id;
                i = users.length;
            }
        }

        io.to(receptor).emit("answerToken", token);
    });

    socket.on('conexion', () => {
        io.emit("conexion");
    });
});