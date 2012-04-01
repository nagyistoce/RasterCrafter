/* Author: Jesse Hattabaugh
 * Started: March 2012
*/

function Player(controller){
	this.controller = controller;
	this.x = 0;
	this.y = 0;
	//todo: load the player's last position
	this.coords = function(){
		return {x:this.x, y:this.y};
	};
	
	this.updateCoords = function(direction){
		// updates a player's coordinates
		// todo: make sure the player can travel onto that block
		// todo: tell the server so it can update other clients
		switch(direction){
			case 'north':
				this.y -= 10;
			break;
			case 'south':
				this.y += 10;
			break;
			case 'east':
				this.x += 10;
			break;
			case 'west':
				this.x -= 10;
			break;
		}
		return this.coords();
	};
}

function World(controller){
	// the main view of the world
	this.controller = controller;
	
	this.offX = 0;
	this.offY = 0;
	
	// todo: resize canvas to fill screen
	this.canvas = $('<canvas id=world width=500 height=500>')
		.appendTo('article[role=main]')[0];
	this.context = this.canvas.getContext('2d');
	
	// todo: handle dynamic world size
	this.background = $('<canvas id=background width=700 height=700>')[0];
	
	// handle arrow keys
	$('body').on('keydown', this, function(e){
		// todo: prevent repetitive presses
		// todo: handle diagonals
		// todo: 
		if(e.which == 37 || e.which == 65){
			e.data.controller.move('west');
		} else if(e.which == 38 || e.which == 87){
			e.data.controller.move('north');
		} else if(e.which == 39  || e.which == 68){
			e.data.controller.move('east');
		} else if(e.which == 40 || e.which == 83){
			e.data.controller.move('south');
		} else {
			console.log('key:'+e.which);
		}
		return false;
	});
	
	this.updateBackground = function(){
		// loads then draws the current chunks to the background canvas
		
		// move unneeded chunks to a cache
		
		// build a list of img src urls for necessary chunks
		this.chunks = []; // array of chunk ids, in order they will be drawn top-left to bottom-right
		
		// populate an array of imgs
		this.images = {}; // dict of img elements,chunk ids as keys
		
		// populate chunks with random colored squares
		for(var i=0; i<7*7; i++){
			chunk = $('<canvas width=100 height=100>')[0];
			ctx = chunk.getContext('2d');
			ctx.fillStyle = "rgb("+
				Math.floor(Math.random()*256)+","+
				Math.floor(Math.random()*256)+","+
				Math.floor(Math.random()*256)+")";
			ctx.fillRect(0,0,100,100);
			this.chunks[i] = chunk;
		}
		
		var ctx = this.background.getContext('2d');
		for(var i=0; i<this.chunks.length; i++){
			ctx.drawImage(this.chunks[i], i%7*100, Math.floor(i/7)*100, 100, 100);
		}
	};
	
	this.drawBackground = function(coords){
		// clear the canvas
		var size = this.canvas.width;
		this.canvas.width = size;
		
		// figure out where to draw the background on the world to reflect the player's coords
		var margin = (this.background.width - this.canvas.width) / 2;
		var centerZero = margin - (100/2 - 10/2);
		
		// find player's coords relative to the center chunk 
		// (funky % work corrects for negative values)
		var centerX = (coords.x%100+100)%100;
		var centerY = (coords.y%100+100)%100;
		
		var x = centerZero + centerX
		var y = centerZero + centerY;
		
		// todo: handle variable world width/height
		// todo: smoothly animate transition
		this.context.drawImage(this.background,x,y,size,size,0,0,size,size);
	};
	
	this.drawPlayer = function(){
		// draws the player at the center of the canvas
		this.context.fillStyle = "red";
		this.context.fillRect(500/2-5,500/2-5,10,10);
	};
	
}

(function(){
	this.world = new World(this);
	this.player = new Player(this);
	
	// initialize world
	this.world.updateBackground();
	this.world.drawBackground(this.player.coords());
	this.world.drawPlayer();
	
	var socket = new io.Socket(null, {rememberTransport: false, port: 8080});
	socket.connect();
	socket.addEvent('message', function(data){
		$('aside').append('<p>'+$.map(data, function(e,i){
			return String.fromCharCode(e);
		})+'</p>');
	});
	
	this.move = function(direction){
		// todo: the player needs a concept of which direction it's facing
		if(['north', 'south', 'east', 'west'].indexOf(direction) !== -1){
			
			var newCoords = this.player.updateCoords(direction);
			// if player is crossing a chunk threshold
			// this.world.updateBackground();
			this.world.drawBackground(newCoords);
			this.world.drawPlayer();
		} else {
			throw 'invalid direction';
		}
	};
}());
