/* Author: Jesse Hattabaugh
 * Started: March 2012
*/

(function(){
	
	// closure for callbacks
	var self = this;
    
    // initialize socket
	this.socket = io.connect();
	
    this.socket.on('who are you', function (data) {
        console.log("prompting for player id");
        do{
			var plid = prompt("What is your name?", "Joe");
		} while(!plid)
		// todo: validate length
		socket.emit('my name is', {plid:plid});
    });
    
    this.socket.on('what is your password', function (data) {
        console.log("prompting for password");
        do{
			var password = prompt(data);
		} while(!password)
		socket.emit('here is my password', {password:password});
    });
    
    this.x = 0;
	this.y = 0;
	// todo: the player needs a concept of which direction it's facing
    
    this.socket.on('welcome', function (pos) {
        console.log("login successfull");
        //console.dir(pos);
        self.x = pos[0];
        self.y = pos[1];
        self.enroll();
        // todo: show canvas
    });
    
    this.moving = false; // whether or not we are in the process of moving
    
    this.move = function(x,y){
		if (!this.moving){
			this.moving = true;
			// todo: if server never replies to this movement, no more 
			// movements will be possible, fix that, maybe timeout?
			console.log('moving to '+x+'/'+y);
			this.socket.emit('move', [x,y]);
		}
	};
	
	// handle movement keys
	$('body').on('keydown', this, function(e){
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
	
	this.chunks = {}; // dictionary of chunks where chuId is key and canvas is val
	
	var chunkSize = 64;
	
	this.enroll = function(){
		var chuX = Math.floor( this.x / chunkSize );
		var chuY = Math.floor( this.y / chunkSize );
		var chuId = chuX + '/' +  chuY;
	    console.log(chuId);
	    
	    if(!chuId in this.chunks){
			this.socket.emit('enroll', {chuId:chuId});
	    }
	    
		// if player crossed a chunk boundary
			// leave chunk channels that are now too far away
			// join chunk channels that are now in range
			
		// todo: 
		// todo: call this function when screen is resized
	}
    
    this.socket.on('you moved', function(to){
		console.log("you moved");
		//console.dir(to);
		self.x = to[0];
		self.y = to[1];
		self.moving = false;
		self.enroll();
    });
    
    this.socket.on('invalid move', function(data){
        console.log("can not move there");
        console.dir(data);
        self.moving = false;
    });
    
    this.socket.on('joined chunk', function(data){
        console.log("you joined chunk x/y");
        console.dir(data);
    });
    
    // todo: this.socket.on()
    
    this.socket.on('someone logged in', function(data){
      console.log("someone logged in");
      console.dir(data);
    });
    
    this.socket.on('someone logged out', function(data){
      console.log("someone logged outw");
      console.dir(data);
    });
    
    this.socket.on('someone joined a chunk', function(data){
      console.log("someone joined a chunk");
      console.dir(data);
    });
    
    this.socket.on('someone left a chunk', function(data){
      console.log("someone left a chunk");
      console.dir(data);
    });
    
    this.socket.on('someone moved', function(data){
        console.log("player moved");
        console.dir(data);
        
        
        // todo: if user moves off chunk remove them from list
    });
    
    this.socket.on('disconnect', function(){
        console.log("You are disconnected");
        // todo: hide controls
    });
    
    this.say = function(msg){
		// todo: send a message over the socket
	};
}());
//todo: I'd prefer to use the new operator
