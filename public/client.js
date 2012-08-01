/* Author: Jesse Hattabaugh
 * Started: March 2012
*/

(function(){
	
	var plid = null;
	var password = null;
    
    // initialize socket
	var socket = io.connect();
	
    socket.on('who are you', function (data) {
        console.log("prompting for player id");
        do{
			plid = prompt("What is your name?", "Joe");
		} while(!plid)
		// todo: validate length
		socket.emit('my name is', {plid: plid});
    });
    
    socket.on('what is your password', function (data) {
        console.log("prompting for password");
        do{
			password = prompt(data);
		} while(!password)
		socket.emit('here is my password', {password:password});
    });
    
    var x = 0;
	var y = 0;
	// todo: the player needs a concept of which direction it's facing
    
    var chunks = {}; // dictionary of chunks where chuId is key and canvas is val
	
	var chunkSize = 64;
	
	function enrollment(){
		var chuX = Math.floor( x / chunkSize );
		var chuY = Math.floor( y / chunkSize );
		var chuId = 'chunks:' + chuX + '/' +  chuY;
	    
	    if(!(chuId in chunks)){
			console.log('enrolling in chunk '+chuId);
			socket.emit('enroll', {chuId:chuId});
	    }
	    
		// leave chunk channels that are now too far away
		
		// todo: call this function when screen is resized
	};
	
	socket.on('welcome', function (pos) {
        console.log("login successfull");
        //console.dir(pos);
        x = pos[0];
        y = pos[1];
        enrollment();
        // todo: show canvas
    });
	
	socket.on('enrolled', function(data){
        console.log("you enrolled in chunk "+data.chuId);
        //console.dir(data);
        chunks[data.chuId] = {};
        //todo: retrieve chunk pixel data from db and draw to a canvas
    });
    
    // todo: socket.on('unenrolled')
    
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
		var from_x = parseInt(x);
		var from_y = parseInt(y);
		
		if(e.which == 37 || e.which == 65){ // west
			move(from_x-1, from_y);
		} else if(e.which == 38 || e.which == 87){ //north
			move(from_x, from_y-1);
		} else if(e.which == 39  || e.which == 68){ // east
			move(from_x+1, from_y);
		} else if(e.which == 40 || e.which == 83){ // south
			move(from_x, from_y+1);
		} else {
			console.log('key:'+e.which);
		}
		return false;
	});
	
	
    
    socket.on('movement', function(data){
		//console.dir(data);
		if(data.plid == plid){
			console.log("you moved");
			x = data.to_x;
			y = data.to_y;
			moving = false;
			enrollment(); // todo: only call this when crossing a chunk boundary
		} else {
			console.log(data.plid+" moved");
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
