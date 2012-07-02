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
    
    this.socket.on('welcome', function (coords) {
        console.log("login successfull");
        self.x = coords.x;
        self.y = coords.y;
        // todo: show stuff
    });
    
    this.socket.on('you moved', function(data){
			console.log("you moved");
			self.x = data.x;
			self.y = data.y;
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
	// todo: seems like this could be wrapped up in a "state" object for easier handling
	this.x = 0;
	this.y = 0;
	// todo: the player needs a concept of which direction it's facing
	
	// handle arrow keys
	$('body').on('keydown', this, function(e){
		// todo: prevent repetitive presses
		// todo: handle diagonals
		// todo: don't capture EVERYTHING it's annoying
		if(e.which == 37 || e.which == 65){ // west
			e.data.move(e.data.x-1, e.data.y);
		} else if(e.which == 38 || e.which == 87){ //north
			e.data.move(e.data.x, e.data.y-1);
		} else if(e.which == 39  || e.which == 68){ // east
			e.data.move(e.data.x+1, e.data.y);
		} else if(e.which == 40 || e.which == 83){ // south
			e.data.move(e.data.x, e.data.y+1);
		} else {
			console.log('key:'+e.which);
		}
		return false;
	});
	
	this.move = function(x,y){
		console.log('moving to ('+x+','+y+')');
		this.socket.emit('move', {x:x,y:y});
	};
}());
