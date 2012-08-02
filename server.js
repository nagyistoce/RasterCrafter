var express = require('express'),
    app = express.createServer(express.static(__dirname + '/public')),
    io = require('socket.io').listen(app),
    redis = require("redis"),
    // Redis must be running on the default localhost port
    db = redis.createClient().on("error", function(err) {
        console.error("Redis Error: " + err);
    });

// serve the app's only html file
app.get('/', function(req, res) {
    res.sendfile('index.html');
});

PORT = process.env.PORT || 5050;
app.listen(PORT);
console.log("Server started on port " + PORT);

function redisDebug(err, res){
	if(err){
		console.error(err);
	}else{
		console.dir(res);
	}
}

io.sockets.on('connection', function(socket) {
    console.log("New connection started");
    socket.emit('who are you');
    // todo: send a unique username
    //socket.broadcast.emit('player joined');
    
    socket.on('my name is', function handleLogin(data){
        console.log("They say their name is "+data.plid);
        socket.set('plid', data.plid, function(){
			db.hget('players:'+data.plid, 'password', function(err, password){
				var message = null;
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
    
    // set up a redis client to listen for messages on chunk channels
    var chunkListener = redis.createClient().on('pmessage', function(pat, chan, msg){
		console.log('activity in '+chan);
		console.dir(msg);
		var data = JSON.parse(msg);
		//todo: validate existence of data.message and data.data
		io.sockets.in(chan).emit(data.message, data.data);
	}).psubscribe('chunks:*');
    
    socket.on('enroll', function(data){
		console.log('enrolling in a chunk');
		console.dir(data);
		
		data.fresh.forEach(function(chuId){
			socket.join(chuId);
		});
		
		data.stale.forEach(function(chuId){
			socket.leave(chuId);
		});
		
		// todo: add pixel data to the fresh chunks
		socket.emit('enrolled', data);
    });
    
    chunkSize = 64;
    
    function chuIdFor(x, y) {
        // returns the chunk id for the coords
        var chuX = Math.floor(x / chunkSize);
        var chuY = Math.floor(y / chunkSize);
        return 'chunks:' + chuX + '/' + chuY;
    }

    socket.on('move', function handleMove(to) {

        console.log("Player movement");
        console.dir(to);

        socket.get('plId', function(err, plId) {
            db.hmget('players:' + plId, 'x', 'y', function(err, from) {
				
                from_x = parseInt(from[0]) || 0;
                from_y = parseInt(from[1]) || 0;
                // these might be empty if player has never moved
                //todo: more random initial spawn point
                
                to_x = parseInt(to[0]) || 0;
                to_y = parseInt(to[1]) || 0;
                
                function taxiDistance(x1, y1, x2, y2){
					return Math.abs(x1-x2) + Math.abs(y1-y2)
                }
                
                if (taxiDistance(from_x, from_y, to_x, to_y) <= 1) {
                    // can only move one tile at a time
                    // todo: check for other players, objects etc
                    
                    db.hmset('players:' + plId, 'x', to_x, 'y', to_y);
                    
                    //socket.emit('you moved', to);
                    var chuId = chuIdFor(to_x, to_y);
                    console.log('publishing a message to '+chuId+' channel');
                    db.publish(chuId, JSON.stringify({
						message: 'movement',
						data: {
							plId: plId,
							from_x: from_x,
							from_y: from_y,
							to_x: to_x,
							to_y: to_y
						}
                    }));
                } else {
                    socket.emit('invalid move', to);
                    console.log(from_x, from_y, to_x, to_y);
                }
            });
        });
    });

    socket.on('disconnect', function() {
        console.log("Connection stopped.");
        io.sockets.emit('player left');
    });
});


