/* Author: Jesse Hattabaugh
 * Started: March 2012
*/

(function(){

	var socket = io.connect();
	
	// Get player Id
	
	var plId = null;
	
    socket.on('who are you', function (data) {
        console.log("prompting for player id");
        do{
			plId = prompt("What is your name?", "Joe");
		} while(!plId)
		// todo: validate length
		socket.emit('my name is', {plId: plId});
    });
    
    // Check password
    
    var password = null;
    
    socket.on('what is your password', function (data) {
        console.log("prompting for password");
        do{
			password = prompt(data);
		} while(!password)
		socket.emit('here is my password', {password:password});
		//todo: hash before sending, return a session key or something
    });
    
    // Initialize player position
    
    var x = null,
		y = null;
	// todo: the player needs a concept of which direction it's facing
    
	socket.on('welcome', function (pos) {
        console.log("login successfull");
        //console.dir(pos);
        x = parseInt(pos[0]);
        y = parseInt(pos[1]);
        enrollment();
        // todo: show canvas
    });
    
    
    // Manage chunk subscriptions and load inital image data
    
    var chunks = {}, // dictionary of chunks where chuId is key and canvas is val
		chunkSize = 64;
	
	function enrollment(){
		var chuX = Math.floor( x / chunkSize ),
			chuY = Math.floor( y / chunkSize ),
			current = [],
			fresh = [],
			stale = [],
			chuId = null;
		
		// build an array of chunks we should end up being subscribed to
		for(var i = -1; i <= 1; i++ ){
			for(var j = -1; j <= 1; j++ ){
				chuId = 'chunks:' + (chuX + i) + '/' + (chuY + j);
				current.push(chuId);
				
				// build an array of chunks that need to be subscribed to
				if(!(chuId in chunks)){
					fresh.push(chuId);
				}
			}
		}
		// todo: the starting and ending values for i and j should be dependant on screen width
	    // todo: call this function when screen is resized
	    
	    // build an array of chunks that need to be unsubscribed from
	    for(k in chunks){
			if( current.indexOf(k) == -1 ){
				stale.push(k);
			}
	    } 
	    
	    
	    if( fresh.length + stale.length > 0 ){
			console.log('updating enrollment');
			socket.emit('enroll', {fresh:fresh, stale:stale});
		} else {
			console.log('enrollment already up to date')
		}
	};
	
	socket.on('enrolled', function(data){
        console.log('enrollment complete');
        //console.dir(data);
        
        data.fresh.forEach(function(val){
			chunks[val] = {};
        });
        
        data.stale.forEach(function(val){
			delete chunks[val];
        });
        //todo: retrieve chunk pixel data from db and draw to a canvas
    });
    
    var moving = false; // whether or not we are in the process of moving
    
    function move(x,y){
		if (!moving){
			moving = true;
			// todo: if server never replies to this movement, no more 
			// movements will be possible, fix that, maybe timeout?
			console.log('moving to '+x+'/'+y);
			
			socket.emit('move', [x,y]);
		}
	}
	
	// handle movement keys
	$('body').on('keydown', function(e){
		// todo: handle diagonals
		// todo: don't capture EVERYTHING it's annoying
		
		
		if(e.which == 37 || e.which == 65){ // west
			move(x-1, y);
		} else if(e.which == 38 || e.which == 87){ //north
			move(x, y-1);
		} else if(e.which == 39  || e.which == 68){ // east
			move(x+1, y);
		} else if(e.which == 40 || e.which == 83){ // south
			move(x, y+1);
		} else {
			console.log('key:'+e.which);
		}
		return false;
	});
	
    socket.on('movement', function(data){
		//console.dir(data);
		if(data.plId == plId){
			console.log("you moved");
			x = data.to_x;
			y = data.to_y;
			moving = false;
			enrollment(); // todo: only do this if we're crossing a chunk boundary
		} else {
			console.log(data.plId+" moved");
		}
    });
    
    socket.on('invalid move', function(data){
        console.log("can not move there");
        console.dir(data);
        moving = false;
    });
    
    socket.on('disconnect', function(){
        console.log("You are disconnected");
        // todo: hide controls
    });
}());
