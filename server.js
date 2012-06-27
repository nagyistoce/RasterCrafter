var app = require('express').createServer()
  , io = require('socket.io').listen(app);

app.listen(process.env.PORT);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/client.js', function (req, res) {
  res.sendfile(__dirname + '/client.js');
});

var players = [];

io.sockets.on('connection', function (socket) {

    socket.emit('welcome', players);
    
    socket.broadcast.emit('player joined');
    
    console.log("New connection started");
    
    socket.on('disconnect', function(){
        console.log("Connection stopped");
        io.sockets.emit('player left');
    });
    
    socket.on('move', function(data){
        console.log("Player movement");
        console.dir(data);
        this.broadcast.emit('player moved', data);
    });
});

console.log("Server Started");