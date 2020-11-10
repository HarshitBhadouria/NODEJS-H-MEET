const express= require('express');
const app= express();
const server = require('http').Server(app);
const io = require('socket.io')(server)   //import io

const { v4: uuidv4 } = require('uuid');

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

app.set('view engine', 'ejs');  //ejs -> embedded javascript
app.use(express.static('public'));

app.use('/peerjs', peerServer);
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);  // it will automatically generate uudid and redirect us to it
})
// uuid (unique id) will generate ramdom unique id for every specific room

app.get('/:room', (req, res) => {
    res.render('room', {roomID: req.params.room})
})

io.on('connection', socket => {
    socket.on('join-room', (roomID, userId) => {
        socket.join(roomID);
        socket.to(roomID).broadcast.emit("user-connected", userId);    //it's gonna broadcast to everyone
        socket.on('message', message => {
            io.to(roomID).emit('createMessage', message)
        })

    })
})





server.listen(3030);