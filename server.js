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

PORT = process.env.PORT || 5000;
app.listen(PORT);
console.log("Server started on port " + PORT);

function redisDebug(err, res) {
    if (err) {
        console.error(err);
    } else {
        console.dir(res);
    }
};

io.sockets.on('connection', function(socket) {
    console.log("New connection started");
    socket.emit('who are you');
    // todo: send a unique username
    //socket.broadcast.emit('player joined');
    
    socket.on('my name is', function handleLogin(data) {
        console.log("They say their name is " + data.plid);
        socket.set('plid', data.plid, function() {
            db.hget('players:' + data.plid, 'password', function(err, password) {
                if (password) {
                    message = 'Enter your password';
                } else {
                    message = 'Set your password';
                }
                socket.emit('what is your password', message);
            });
        });

        console.log('my_name_is:' + data.plid);
    });

    socket.on('here is my password', function handlePassword(data) {
        console.log("Recieved a password");
        socket.get('plid', function(err, plid) {
            db.hget('players:' + plid, 'password', function(err, password) {
                if (password) {
                    if (data.password == password) {
                        db.hmget('players:' + plid, 'x', 'y', function(err, coords) {
                            socket.emit('welcome', coords || [0, 0]);
                        });
                    } else {
                        socket.emit('what is your password', 'Incorrect Password, Try Again');
                    }
                } else {
                    db.hset('players:' + plid, 'password', data.password, function setNewPassword(err, res) {
                        socket.set('authenticated', true, function() {
                            socket.emit('welcome', [0, 0]);
                        });
                    });
                }
            });
        });
    });

    function chuidFor(x, y) {
        // returns the chunk id for the coords
        chu_x = x / 16;
        chu_y = y / 16;
        return 'chunks:' + chu_x + ':' + chu_y;
    }

    socket.on('move', function handleMove(to) {

        console.log("Player movement");
        console.dir(to);

        socket.get('plid', function(err, plid) {
            db.hmget('players:' + plid, 'x', 'y', function(err, from) {
				
                from_x = parseInt(from[0]) || 0;
                from_y = parseInt(from[1]) || 0;
                // these might be empty if player has never moved
                //todo: more random initial spawn point
                
                to_x = parseInt(to[0]) || 0;
                to_y = parseInt(to[1]) || 0;
                
                from_chuid = chuidFor(from_x, from_y);
                to_chuid = chuidFor(to_x, to_y);
                
                function taxiDistance(x1, y1, x2, y2){
					return Math.abs(x1-x2) + Math.abs(y1-y2)
                }
                
                
                if (taxiDistance(from_x, from_y, to_x, to_y) <= 1) {
                    // can only move one tile at a time
                    //todo: check for other players, objects etc
                    if (to_x !== from_x) {
                        // moving horizontal
                        if (to_x < from_x) {
                            // west
                            var west;
                        } else {
                            // east
                            var east;
                        }
                    } else if (to_y !== from_y) {
                        // moving vertical
                        if (to_y < from_y) {
                            // south
                            var south;
                        } else {
                            // north
                            var north;
                        }
                    } else if (to_x == from_x && to_y == from_y) {
                        // not moving
                        var none;
                    }

                    // given x and y, which chunks need to be sub/unsubed from?
                    // when
                    // todo: determine which chunks the player is involved in
                    // todo: determine which chunks the player is no longer involved in
                    // todo: open pub clients if necessary
                    // todo: open sub clients if necessary
                    // todo: join chunk rooms
                    // todo: leave chunk rooms
                    db.hmset('players:' + plid, 'x', to_x, 'y', to_y);
                    socket.emit('you moved', to);
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


