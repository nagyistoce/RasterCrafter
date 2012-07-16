var express = require('express'),
    app = express.createServer(express.static(__dirname + '/public')),
    io = require('socket.io').listen(app),
    redis = require("redis"),
    // currently the Redis connection is the default localhost:port
    db = redis.createClient().on("error", function(err) {
        console.error("Redis Error: " + err);
    });

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
    // send the player the chunks they are currently standing on
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
            db.hget('players:' + plid, 'password', function getPassword(err, password) {
                if (password) {
                    if (data.password == password) {
                        db.hgetall('players:' + plid, function getPlayerHash(err, coords) {
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
        // if player crossed a chunk boundary
        // unsubscribe from chunk channels that are now too far away
        // subscribe to chunk channels that are now in range
        console.log("Player movement");
        console.dir(to);

        socket.get('plid', function(err, plid) {
            db.hmget('players:' + plid, 'x', 'y', function(err, from) {

                from_x = from[0] || 0;
                from_y = from[1] || 0;
                // these might be empty if player has never moved
                //todo: more random initial spawn point
                to_x = to[0] || from_x;
                to_y = to[1] || from_y;
                // not sure why these would be empty but just in case
                from_chuid = chuidFor(from_x, from_y);
                to_chuid = chuidFor(to_x, to_y);

                //todo: check for other players, objects etc
                if (Math.abs(from_x - to_x) <= 1 && Math.abs(from_y - to_y) <= 1) {
                    // can only move one tile at a time
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
                }
            });
        });
    });

    socket.on('disconnect', function() {
        console.log("Connection stopped.");
        io.sockets.emit('player left');
    });
});


