var app = require('express').createServer(),
	io = require('socket.io').listen(app),
	redis = require("redis");
	
if(process.env.REDISTOGO_URL){
	var rtg = require('url').parse(process.env.REDISTOGO_URL);
	var cache = redis.createClient(rtg.port, rtg.hostname).
		auth(rtg.auth.split(":")[1]);
} else {
	var cache = redis.createClient();
}	

cache.on("error", function (err) {
	console.log("Redis Error: " + err);
});

app.listen(process.env.PORT);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
  cache.incr("counts:index:requests");
});

app.get('/client.js', function (req, res) {
  res.sendfile(__dirname + '/client.js');
});

io.sockets.on('connection', function (socket) {
	
	players = cache.incr("counts:sockets:players");
	
    socket.emit('welcome', players);
    
    socket.broadcast.emit('player joined');
    
    console.log("New connection started");
    
    socket.on('disconnect', function(){
		players = cache.decr("counts:sockets:players");
        console.log("Connection stopped. "+players+" players remaining.");
        io.sockets.emit('player left');
    });
    
    socket.on('move', function(data){
        console.log("Player movement");
        console.dir(data);
        this.broadcast.emit('player moved', data);
    });
});

console.log("Server Started");
