var express = require('express'),
	app = express.createServer(express.static(__dirname+'/public')),
	io = require('socket.io').listen(app),
	redis = require("redis"),
	db = redis.createClient().on("error", function (err) {
		console.error("Redis Error: " + err);
	});

app.get('/', function(req, res){
	res.sendfile('index.html');
});

app.listen(process.env.PORT);

function redisDebug(err, res){
	if(err){
		console.error(err);
	}else{
		console.dir(res);
	}
};

io.sockets.on('connection', function (socket) {
    console.log("New connection started");
    socket.emit('who are you');
    // todo: send a unique username
    
    //socket.broadcast.emit('player joined');
    // send the player the chunks they are currently standing on
    
    var my_name_is = 'cool';
    
    socket.on('my name is', function handleLogin(data){
        console.log("They say their name is "+data.plid);
        socket.set('plid', data.plid, function(){
			db.hget('players:'+data.plid, 'password', function(err, password){
				if(password){
					message = 'Enter your password';
				} else {
					message = 'Set your password';
				}
				socket.emit('what is your password', message);
			});
		});
		
		console.log('my_name_is:'+my_name_is);
    });
    
    socket.on('here is my password', function handlePassword(data){
		console.log("Recieved a password");
		socket.get('plid', function(err, plid){
			db.hget('players:'+plid, 'password', function getPassword(err, password){
				if(password){
					if(data.password == password) {
						db.hgetall('players:'+plid, function getPlayerHash(err, coords){
							socket.emit('welcome', coords || [0,0]);
						});
					} else {
						socket.emit('what is your password', 'Incorrect Password, Try Again');
					}
				} else {
					db.hset('players:'+plid, 'password', data.password, function setNewPassword(err, res){
						socket.set('authenticated', true, function(){
							socket.emit('welcome', [0,0]);
						});
					});
				}
			});
		});
		
		
    });
    
    socket.on('move', function handleMove(data){
		// if player crossed a chunk boundary
		// unsubscribe from chunk channels that are now too far away
		// subscribe to chunk channels that are now in range
        console.log("Player movement");
        console.dir(data);
        
        socket.get('plid', function(err, plid){
			db.hgetall('players:'+plid, function getPlayerToMove(err, player){
				
				if(!player.x || !player.y){
					console.log('player has never moved before');
					player = data;
				}
				console.log('x abs('+player.x+' - '+data.x+') = '+Math.abs(player.x - data.x));
				//todo: check for other players, objects etc
				if( Math.abs(player.x - data.x) <= 1 && 
					Math.abs(player.y - data.y) <= 1 ){
					
					db.hmset('players:'+plid, 'x', data.x, 'y', data.y);
					socket.emit('you moved', data);
				}
				else{
					socket.emit('invalid move', data);
				}
			});
		});
    });
    
    socket.on('disconnect', function(){
        console.log("Connection stopped.");
        io.sockets.emit('player left');
    });
});

console.log("Server started on port "+process.env.PORT);
