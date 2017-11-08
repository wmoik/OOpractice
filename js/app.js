function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Background Object, making this a class allows the player object to modify the Background
var Block = function(img) {

    this.isHeld = false;
    this.x = 400;
    this.y = 400;


    this.sprit = 'images/stone-block';
}

var backgroundBlocks = function() {
    this.numRows = 6;
    this.numCols = 5;
    this.imgBracket = [
      ['images/water-block.png', 'images/water-block.png', 'images/water-block.png', 'images/water-block.png', 'images/water-block.png'],  // Top row is water
      ['images/stone-block.png', 'images/stone-block.png', 'images/stone-block.png', 'images/stone-block.png', 'images/stone-block.png'],  // Row 1 of 3 of stone
      ['images/stone-block.png', 'images/stone-block.png', 'images/stone-block.png', 'images/stone-block.png', 'images/stone-block.png'],  // Row 2 of 3 of stone
      ['images/stone-block.png', 'images/stone-block.png', 'images/stone-block.png', 'images/stone-block.png', 'images/stone-block.png'],   // Row 3 of 3 of stone
      ['images/grass-block.png', 'images/grass-block.png', 'images/grass-block.png', 'images/grass-block.png', 'images/grass-block.png'],// Row 1 of 2 of grass
      ['images/grass-block.png', 'images/grass-block.png', 'images/grass-block.png', 'images/grass-block.png', 'images/grass-block.png']    // Row 2 of 2 of grass
    ];
}

backgroundBlocks.prototype.render = function() {
  // Logic works but is super confusing. Find more consise logic.
  var startingRow = this.imgBracket.length - this.numRows - player.mapPos
  for (row = startingRow; row < startingRow + this.numRows; row++) {
      for (col = 0; col < this.numCols; col++) {
          /* The drawImage function of the canvas' context element
           * requires 3 parameters: the image to draw, the x coordinate
           * to start drawing and the y coordinate to start drawing.
           * We're using our Resources helpers to refer to our images
           * so that we get the benefits of caching these images, since
           * we're using them over and over.
           */
           ctx.drawImage(Resources.get(this.imgBracket[row][col]), col * 101, (row-startingRow) * 83);
      }
  }
}

backgroundBlocks.prototype.update = function() {
    if (player.movableCamera === true) {
      // Check if player gets 3 blocks from the top, if so shift up the background
      if (player.rowNum - player.mapPos > 3) {
        // shift player downward to make it look like the background is moving
        player.y += 83;
        //player.mapPos keep tracks of how many maps movements were made vertically. Needed to keep track of which background blocks to show
        player.mapPos++;
        // shift all materials with background
        materials.y += 83;
        //check if the top layer has yet to be created, if not then create it
        if (player.rowNum > this.imgBracket.length - player.maxDistToTop){
            this.imgBracket.unshift(['images/water-block.png', 'images/water-block.png', 'images/water-block.png', 'images/water-block.png', 'images/water-block.png']);
        }
        allEnemies.forEach(function(enemy) {
            enemy.y += 83;
        })
      }
      if ((player.rowNum - player.mapPos < 3) && (player.rowNum > 2)) {
        player.y -= 83;
        materials.y -= 83;
        player.mapPos--;
        allEnemies.forEach(function(enemy) {
            enemy.y -= 83;
        })
      }
    }
}

// Enemies our player must avoid
var Enemy = function() {
    this.x = -100;
    this.y = getRandomInt(1,3) * 83 - 29; // Randomize where enemies appear
    this.speedx = getRandomInt(1, 7) * 50;
    this.speedy = 0;
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};
// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speedx*dt;
    this.y += this.speedy*dt;

    if (this.x > 610) {
      this.x = -100;
      this.y = getRandomInt(1,3) * 83 - 29 + 83*player.mapPos;
      this.speedx = getRandomInt(3, 7) * 50;
    }
};


// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Materials/Objects placed on the field that are not considered background
var Materials = function() {
  this.x = 400;
  this.y = 400;

  this.sprite = 'images/Rock.png';
}

Materials.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite),this.x,this.y);
}



// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.x = 200;
    this.rowNum = 2;
    this.y = 300;
    this.colNum = 3;
    this.speedx = 0;
    this.speedy = 0;
    this.numLives = 3;
    this.level = 1;
    this.movableCamera = false;
    this.holdBlock = false;
    this.holdBlockType = 'images/stone-block.png';
    this.maxDistToBot = 4;
    this.maxDistToTop = 3;
    this.mapPos = 0;

    this.sprite = 'images/char-boy.png';
}

Player.prototype.update = function() {
  this.x += this.speedx;
  this.y += this.speedy;
  this.rowNum -= this.speedy/83;
  this.colNum += this.speedx/101;
  this.speedx = 0;
  this.speedy = 0;
  if (blocks.imgBracket[blocks.imgBracket.length-this.rowNum][this.colNum-1] == 'images/water-block.png') {
    this.x = 200;
    this.y = 300;
    player.rowNum = 2;
    player.colNum = 3;
    this.levelUp()
  }
}

Player.prototype.levelUp = function() {
    //allEnemies.push(new Enemy) // Add New Enemy for every level
    this.level++;
    this.numLives++;
    if (this.level === 4) {
        //this.holdblock = true;
        this.movableCamera = true;
    }
}
// Players ability to build background
Player.prototype.build = function() {
  //Check if the player is holding a block and if (s)he is just below a water tile
    if ((this.holdBlock) && (blocks.imgBracket[blocks.imgBracket.length-this.rowNum-1][this.colNum-1] === 'images/water-block.png') ) {
      blocks.imgBracket[blocks.imgBracket.length-this.rowNum-1][this.colNum-1] = this.holdBlockType;
      this.holdBlock = false; // Remove block from player
      this.movableCamera = true;
    }
}
Player.prototype.collect = function() {
  //Check if material is close by
    if ( Math.abs(materials.x - player.x)<200 || Math.abs(materials.y - player.y)<200 ) {
      if (materials.sprite == "images/Rock.png") {
        this.holdBlockType = 'images/stone-block.png'
        this.holdBlock = true; // Add block to player
      }
    }
}



// Draw the player on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


Player.prototype.handleInput = function(inputDirection) {
    if (inputDirection === 'left') {
      this.speedx = -101;
    } else if (inputDirection === 'right') {
      this.speedx = 101;
    } else if (inputDirection === 'up') {
      this.speedy = -83;
    } else if (inputDirection === 'down') {
      this.speedy = 83;
    } else if (inputDirection === 'space') {
      player.build();
      player.collect();
    }

    // Separate if tree for clarity
    // check surrounding tiles to see if input is viable if map is movable (activated by event/level)
    if (this.movableCamera) {
    // first check input and sides of map
      if (inputDirection === 'left')  {
        if (this.colNum===1) {
          this.speedx = 0;
        } else if ((this.level >= 4) && (inputDirection === 'left') && (blocks.imgBracket[blocks.imgBracket.length-this.rowNum][this.colNum-2] === 'images/water-block.png')) {
          this.speedx = 0;
        }
      }
      if (inputDirection === 'right') {
        if (this.colNum===5) {
          this.speedx = 0;
        } else if ((this.level >= 4) && (inputDirection === 'right') && (blocks.imgBracket[blocks.imgBracket.length-this.rowNum][this.colNum] === 'images/water-block.png')) {
          this.speedx = 0;
        }
      }
      if ((this.level >= 4) && (inputDirection === 'up') && (blocks.imgBracket[blocks.imgBracket.length-this.rowNum-1][this.colNum-1] === 'images/water-block.png')) {
        this.speedy = 0;
      }
      if ((this.level >= 4) && (inputDirection === 'down') && (blocks.imgBracket[blocks.imgBracket.length-this.rowNum+1][this.colNum-1] === 'images/water-block.png')) {
        this.speedy = 0;
      }
    }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [
  new Enemy,
  new Enemy,
  new Enemy
];
var player = new Player;
var blocks = new backgroundBlocks;
var materials = new Materials; // Later will be expanded to be many different materials

//Set level and lives
var level = 1;
var numLives = 3;


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'space'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
