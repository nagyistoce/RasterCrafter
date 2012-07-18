/* Author: Jesse Hattabaugh
 * Started: March 2012
*/

(function(){
	
	// closure for callbacks
	var self = this;
    
    // initialize socket
	this.socket = io.connect();
	
	
	// todo: seems like this could be wrapped up in a "state" object for easier handling
	this.x = 0;
	this.y = 0;
	// todo: the player needs a concept of which direction it's facing
    
    this.socket.on('who are you', function (data) {
        console.log("prompting for player id");
        do{
			plid = prompt("What is your name?", "Joe");
		} while(!plid)
		// todo: validate length
		socket.emit('my name is', {plid:plid});
    });
    
    this.socket.on('what is your password', function (data) {
        console.log("prompting for password");
        do{
			password = prompt(data);
		} while(!password)
		socket.emit('here is my password', {password:password});
    });
    
    this.socket.on('welcome', function (start) {
        console.log("login successfull");
        console.dir(start);
        self.x = start[0];
        self.y = start[1];
        // todo: show stuff
    });
    
    this.moving = false; // whether or not we are in the process of moving
    
    this.move = function(x,y){
		if (!this.moving){
			this.moving = true;
			console.log('moving to ('+x+','+y+')');
			this.socket.emit('move', [x,y]);
		}
	};
	
	// handle movement keys
	$('body').on('keydown', this, function(e){
		// todo: prevent repetitive presses
		// todo: handle diagonals
		// todo: don't capture EVERYTHING it's annoying
		var from_x = parseInt(e.data.x);
		var from_y = parseInt(e.data.y);
		
		if(e.which == 37 || e.which == 65){ // west
			e.data.move(from_x-1, from_y);
		} else if(e.which == 38 || e.which == 87){ //north
			e.data.move(from_x, from_y-1);
		} else if(e.which == 39  || e.which == 68){ // east
			e.data.move(from_x+1, from_y);
		} else if(e.which == 40 || e.which == 83){ // south
			e.data.move(from_x, from_y+1);
		} else {
			console.log('key:'+e.which);
		}
		return false;
	});
    
    this.socket.on('you moved', function(to){
		console.log("you moved");
		console.dir(to);
		self.x = to[0];
		self.y = to[1];
		self.moving = false;
		// if player crossed a chunk boundary
        // unsubscribe from chunk channels that are now too far away
        // subscribe to chunk channels that are now in range
    });
    
    this.socket.on('invalid move', function(data){
        console.log("can not move there");
        console.dir(data);
    });
    
    this.socket.on('someone joined', function(data){
      console.log("player joined");
      console.dir(data);
    });
    
    this.socket.on('someone left', function(data){
      console.log("player left");
      console.dir(data);
    });
    
    this.socket.on('someone moved', function(data){
        console.log("player moved");
        console.dir(data);
        
        // todo: add the player to a list of visible players
        // todo: if user moves off chunk remove them from list
    });
    
    this.socket.on('disconnect', function(){
        console.log("You are disconnected");
        // todo: hide stuff
    });
    
    this.say = function(msg){
		// todo: send a message over the socket
	};
}());
