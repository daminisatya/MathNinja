
var currentBlock = false;
var canvasWidth = 900;
var canvasHeight = 600;
var blockSize = 50;
var currentPuzzleIndex = 0;
var blocks = new Array();
var beginX = false;
var beginY = false;
var blockIndex = 0;
var solvedPuzzles = new Array();

$(document).ready(function () {
  draw();
  
  $('#debugButton').bind('click', function () {
    $('#debug').html('');
    
    odebug(blocks);
  });
  
  $('#restart').bind('click', function () {
    blocks = new Array();
    $('#dropZone .droppableBox').remove();
    updatePoints();
  });
  
  //$('#previous').attr('disabled', true);
  //$('#next').attr('disabled', true);
  
  $('#previous').bind('click', function () {
    blocks = new Array();
    $('#dropZone .droppableBox').remove();
    updatePoints();
    
    if (currentPuzzleIndex < puzzles.length) {
      //$('#next').attr('disabled', false);
    }
    
    currentPuzzleIndex--;
    
    if (currentPuzzleIndex < 0) {
      currentPuzzleIndex = 0;
      //$('#previous').attr('disabled', true);
    }
    
    $('#puzzleNumber').html('Puzzle: #' + (currentPuzzleIndex+1));

    draw();
  });
  
  $('#next').bind('click', function () {
  
    if (currentPuzzleIndex > 0) {
      $('#previous').attr('disabled', false);
    }
 
    updatePoints();
    blocks = new Array();
    $('#dropZone .droppableBox').remove();

    currentPuzzleIndex++;
    
    // maximum 25 puzzles to begin with
    if (currentPuzzleIndex > puzzles.length - 1) {
      currentPuzzleIndex = puzzles.length - 1;
    }
    
    if (currentPuzzleIndex < puzzles.length && solvedPuzzles[(currentPuzzleIndex+1)]) {
      //$('#next').attr('disabled', false);
    } else {
      //$('#next').attr('disabled', true);
    }
    
    $('#puzzleNumber').html('Puzzle: #' + (currentPuzzleIndex+1));
    solvedPuzzles[currentPuzzleIndex] = true;
    draw();
  });
  
  var dragOptions = {};
  dragOptions.helper = "clone";
  dragOptions.opacity = 1;
  dragOptions.cursor = "move";
  dragOptions.cursorAt = { top: 30, left: 30 };
  
  dragOptions.drag = function(event, ui) {
    var backgroundColor;
    if ($(ui.helper).attr('id').charAt(0) == 's') {
      var squareSize = $(ui.helper).attr('id').replace('square', '');
      var height = squareSize * blockSize - 8;
      var width = squareSize * blockSize - 8;
      
      switch (squareSize*1) {
        case 1:
          backgroundColor = '#e8ff69';
          break;
        case 2:
          backgroundColor = '#f1c232';
          break;
        case 3:
          backgroundColor = '#93c47d';
          break;
        case 4:
          backgroundColor = '#a2c4c9';
          break;
        case 5:
          backgroundColor = '#e06666';
          break;
      }
    } else {
      var id = $(ui.helper).attr('id').replace('rectangle', '');
      var split = id.split('x');

      var width = split[0]*blockSize - 8;
      var height = split[1]*blockSize - 8;
      
      switch (id) {
        case '1x2':
          backgroundColor = '#bbce54';
          break;
        case '1x3':
          backgroundColor = '#bf9000';
          break;
        case '2x3':
          backgroundColor = '#6aa84f';
          break;
        case '2x4':
          backgroundColor = '#76a5af';
          break;
        case '3x4':
          backgroundColor = '#934242';
          break;
        case '2x1':
          backgroundColor = '#bbce54';
          break;
        case '3x1':
          backgroundColor = '#bf9000';
          break;
        case '3x2':
          backgroundColor = '#6aa84f';
          break;
        case '4x2':
          backgroundColor = '#76a5af';
          break;
        case '4x3':
          backgroundColor = '#934242';
          break;
      }
    }
    
    $(ui.helper)
      .css('width', width + 'px')
      .css('height', height + 'px')
      .css('background', 'none')
      .css('background-color', backgroundColor);
  }
  
  $('#square1').draggable(dragOptions);
  $('#square2').draggable(dragOptions);
  $('#square3').draggable(dragOptions);
  $('#square4').draggable(dragOptions);
  $('#square5').draggable(dragOptions);
  $('#rectangle1x2').draggable(dragOptions);
  $('#rectangle1x3').draggable(dragOptions);
  $('#rectangle2x3').draggable(dragOptions);
  $('#rectangle2x4').draggable(dragOptions);
  $('#rectangle3x4').draggable(dragOptions);
  $('#rectangle2x1').draggable(dragOptions);
  $('#rectangle3x1').draggable(dragOptions);
  $('#rectangle3x2').draggable(dragOptions);
  $('#rectangle4x2').draggable(dragOptions);
  $('#rectangle4x3').draggable(dragOptions);

  var dropOptions = {};
  dropOptions.accept = ".droppableBox";
  dropOptions.drop = function(event, ui) {
    
    var offset = $('#theCanvas').offset();
    // position of the element, minus the offset, minus the width of the border
    var x = ui.absolutePosition.left - offset.left;
    var y = ui.absolutePosition.top - offset.top;
    
    if ($(ui.helper).attr('id').charAt(0) == 's') {
      var squareSize = $(ui.helper).attr('id').replace('square', '');
      var height = squareSize * 50 - 8;
      var width = squareSize * 50 - 8;
      var isSquare = true;
    } else {
      var squareSize = $(ui.helper).attr('id').replace('square', '');
      var id = $(ui.helper).attr('id').replace('rectangle', '');
      var split = id.split('x');

      var width = split[0]*blockSize - 8;
      var height = split[1]*blockSize - 8;
      var isSquare = false;
    }
    
    var movingBlock = false;
    
    if (squareSize && squareSize.charAt(0) == 'b') {
      
      var blockId = $(ui.helper).attr('id').replace('block-', '');
      
      if ($(ui.helper).hasClass('square')) {
          squareSize = parseInt($(ui.helper).attr('class').replace('droppableBox', '').replace('square', '').replace('block-', ''));
        var height = squareSize * 50 - 8;
        var width = squareSize * 50 - 8;
        var isSquare = true;
      }
      
      if ($(ui.helper).hasClass('rectangle')) {
        var id = $(ui.helper).attr('class').replace('droppableBox', '').replace('rectangle', '').replace('rectangle-', '').replace('  ', '').substring(0, 3);
        var split = id.split('x');
        
        var width = split[0]*blockSize - 8;
        var height = split[1]*blockSize - 8;
        var isSquare = false;
      }
      
      movingBlock = true;
    }
    
    var backgroundColor;
    if (isSquare) {
      switch (squareSize*1) {
        case 1:
          backgroundColor = '#e8ff69';
          break;
        case 2:
          backgroundColor = '#f1c232';
          break;
        case 3:
          backgroundColor = '#93c47d';
          break;
        case 4:
          backgroundColor = '#a2c4c9';
          break;
        case 5:
          backgroundColor = '#e06666';
          break;
      }
    } else {
      switch (id) {
        case '1x2':
          backgroundColor = '#bbce54';
          break;
        case '1x3':
          backgroundColor = '#bf9000';
          break;
        case '2x3':
          backgroundColor = '#6aa84f';
          break;
        case '2x4':
          backgroundColor = '#76a5af';
          break;
        case '3x4':
          backgroundColor = '#934242';
          break;
        case '2x1':
          backgroundColor = '#bbce54';
          break;
        case '3x1':
          backgroundColor = '#bf9000';
          break;
        case '3x2':
          backgroundColor = '#6aa84f';
          break;
        case '4x2':
          backgroundColor = '#76a5af';
          break;
        case '4x3':
          backgroundColor = '#934242';
          break;
      }
    }
 
    // first round off the positions
    x = Math.round(x/blockSize)*blockSize;
    y = Math.round(y/blockSize)*blockSize;
    
    // first check that the block is inside the puzzle
    if (notInsidePuzzle(x, y, width, height)) {
      // get rid of the block
      $('#block-' + blockId).remove();
     
      // get rid of the block data
      var temp = new Array();
      
      for (var i in blocks) {
        if (i != blockId) {
          temp[i] = blocks[i];
        }
      }

      blocks = temp;
      
      // reset the initial location
      beginX = false;
      beginY = false;
      
      updatePoints();
      return;
    }
    
    // now check that there is no overlap with another existing block
    if (noOverlap(x, y, width, height, blockId)) {
      $('#block-' + blockId)
        .css('top', beginY + 'px')
        .css('left', beginX + 'px');
      
      blocks[blockId] = {'x': beginX, 'y': beginY, 'width': width, 'height': height};
      
      // reset the initial location
      beginX = false;
      beginY = false;
      return;
    }
    
    var left = x + 'px';
    var top = y + 'px';
    
    if (!movingBlock) {
      // now add the block with appropriate
      
      blockIndex++;
      blocks[blockIndex] = {'x': x, 'y': y, 'width': width, 'height': height};
      blockId = blockIndex;
      
      var block = '<div id="block-';
      block += blockIndex;
      block += '" style="border: 4px solid gold; display: block; width: ';
      block += width + '; height: ';
      block += height;
      block += ';position: absolute; left: ';
      block += left;
      block += '; top: ';
      block += top;
      block += ';background-color: ';
      block += backgroundColor;
      
      if (isSquare) {
        block += '" class="droppableBox square block-' + squareSize + '"></div>';
      } else {
        block += '" class="droppableBox rectangle rectangle-' + split[0] + 'x' + split[1] + '"></div>';
      }
    
      $('#dropZone').append(block);
      
      // now make the new block draggable
      var dragOptions = {};
      dragOptions.opacity = 0.5;
      dragOptions.cursor = "move";
      dragOptions.cursorAt = { top: 30, left: 30 };
      dragOptions.drag = function (event, ui) {
      
        $('.droppableBox').css('z-index', 1);
        $(ui.helper).css('z-index', 10);
        if (!beginX) {
          var offset = $('#theCanvas').offset();
          // position of the element, minus the offset, minus the width of the border
          
          var blockId = $(ui.helper).attr('id').replace('block-', '');
          
          beginX = blocks[blockId].x;
          beginY = blocks[blockId].y;
        }
      }
      
      $('#block-' + blockId).draggable(dragOptions);
      
    } else {
      
      $('#block-' + blockId)
        .css('top', top)
        .css('left', left);
        
      blocks[blockId] = {'x': x, 'y': y, 'width': width, 'height': height};
      
      // reset the initial location
      beginX = false;
      beginY = false;
    }

    
    // now check to see if the puzzle is complete
    if (puzzleIsComplete()) {
      if (currentPuzzleIndex < puzzles.length - 1) {
        $('#next').attr('disabled', false);
      }
    }
    
    updatePoints();
	}
  
  $('#dropZone').droppable(dropOptions);
  
});

function updatePoints() {
  var count = 0;
  for (var i in blocks) {
    var width = Math.round(blocks[i].width/blockSize);
    var height = Math.round(blocks[i].height/blockSize);
    
    if (width != 1 || height != 1) {
      count += height*height*width*width;
    }
  }
  
  $('#points').html('Points: ' + count);
}

function puzzleIsComplete() {
  var scale = 20;
  var tolerance = scale*scale;
  createMiniatureCanvas();
  
  // sample the canvas to find the area of the puzzle
  var canvas = document.getElementById('theHiddenCanvas');  
  var ctx = canvas.getContext('2d');
  
  var imgd = ctx.getImageData(0, 0, Math.round(canvasWidth/blockSize)*scale, Math.round(canvasHeight/blockSize)*scale);
  var pix = imgd.data;
  
  var n;
  var area1 = 0;
  for (var i = 0, n = pix.length; i < n; i += 4) {
    if (pix[i] == 0) {
      area1++;
    }
  }
  
  // clear the canvas and draw the puzzle blocks
  ctx.beginPath();
  ctx.rect(0, 0, Math.round(canvasWidth/blockSize)*scale, Math.round(canvasHeight/blockSize)*scale);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.stroke();
  
  // loop through each block and add it to the diagram
  for (var i = 0; i < blocks.length; i++) {
  
    if (blocks[i]) {
      ctx.beginPath();
      ctx.rect(Math.round(blocks[i].x/blockSize)*scale, Math.round(blocks[i].y/blockSize)*scale, Math.round(blocks[i].width/blockSize)*scale, Math.round(blocks[i].height/blockSize)*scale);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.stroke();
    }
  }
  
  // now re-sample the canvas
  var imgd = ctx.getImageData(0, 0, Math.round(canvasWidth/blockSize)*scale, Math.round(canvasHeight/blockSize)*scale);
  var pix = imgd.data;
  
  var n;
  var area2 = 0;
  for (var i = 0, n = pix.length; i < n; i += 4) {
    if (pix[i] == 0) {
      area2++;
    }
  }
  
  $('#theHiddenCanvas').remove();
  
  //debug(area1 + ',' + area2);
  
  // google chrome hack
  if (Math.abs(area1 - area2) <= tolerance/2) {
    return true;
  }
  
  return false;
}

function notInsidePuzzle(x, y, width, height) {
  var scale = 20;
 
  var puzzle = puzzles[currentPuzzleIndex];
  var points = new Array();
  points[0] = [x/blockSize, y/blockSize]; // top left corner
  points[1] = [(x + width)/blockSize, y/blockSize]; // top right corner
  points[2] = [x/blockSize, (y + height)/blockSize]; // bottom left corner
  points[3] = [(x + width)/blockSize, (y + height)/blockSize]; // bottom right corner
  
  var tolerance = scale*scale;
  
  // insert the miniature puzzle 
  createMiniatureCanvas();
  
  var canvas = document.getElementById('theHiddenCanvas');  
  var ctx = canvas.getContext('2d');
  
  var imgd = ctx.getImageData(0, 0, Math.round(canvasWidth/blockSize)*scale, Math.round(canvasHeight/blockSize)*scale);
  var pix = imgd.data;

  
  var n;
  var area1 = 0;
  for (var i = 0, n = pix.length; i < n; i += 4) {
    if (pix[i] == 0) {
      area1++;
    }
  }
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(points[0][0]*scale, points[0][1]*scale);
  ctx.lineTo(points[0][0]*scale + Math.round(width/blockSize)*scale, points[0][1]*scale);
  ctx.lineTo(points[0][0]*scale + Math.round(width/blockSize)*scale, points[0][1]*scale + Math.round(height/blockSize)*scale);
  ctx.lineTo(points[0][0]*scale, points[0][1]*scale + Math.round(height/blockSize)*scale);
  ctx.lineTo(points[0][0]*scale, points[0][1]*scale);
  
  //ctx.rect(points[0][0]*scale, points[0][1]*scale, Math.round(width/blockSize)*scale, Math.round(height/blockSize)*scale);
  ctx.fillStyle = '#000000';
  ctx.fill();
  ctx.stroke();
  
  var imgd = ctx.getImageData(0, 0, Math.round(canvasWidth/blockSize)*scale, Math.round(canvasHeight/blockSize)*scale);
  var pix = imgd.data;
  
  var n;
  var area2 = 0;
  var count = 0;
  for (var i = 0, n = pix.length; i < n; i += 4) {
    count++;
    if (pix[i] == 0) {
      area2++;
    }
  }
  
  $('#theHiddenCanvas').remove();

  // google chrome hack
  if (Math.abs(area1 - area2) > tolerance/2) {
    return true;
  }
 
  return false;
}

function createMiniatureCanvas() {
  var scale = 20;
  
  // create a new Canvas element
  var canvas = '<canvas id="theHiddenCanvas" width="';
  canvas += Math.round(canvasWidth/blockSize)*scale;
  canvas += '" height="';
  canvas += Math.round(canvasHeight/blockSize)*scale;
  canvas += '" /></canvas>';
  
  $('#dropZone').append(canvas);
  
  $('#theHiddenCanvas')
    .css('position', 'absolute')
    .css('left', '100px');
    //.css('left', '-9999px');
  
  var canvas = document.getElementById('theHiddenCanvas');  
  var ctx = canvas.getContext('2d');

  
  ctx.beginPath();
  ctx.rect(0, 0, Math.round(canvasWidth/blockSize)*scale, Math.round(canvasHeight/blockSize)*scale);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.stroke();
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  
  var currentPuzzle = puzzles[currentPuzzleIndex];
  
  var x = currentPuzzle[0][0]*scale;
  var y = currentPuzzle[0][1]*scale;
  
  ctx.moveTo(x, y);
  
  // draw lines between each point on the puzzle
  for (var i = 1; i <= currentPuzzle.length; i++) {
    var x = currentPuzzle[i % currentPuzzle.length][0]*scale;
    var y = currentPuzzle[i % currentPuzzle.length][1]*scale;
    ctx.lineTo(x, y);
  }
  
  ctx.fill();
  ctx.stroke();
}

function noOverlap(x, y, width, height, blockId) {

  // check to see if the current block overlaps with any of the existing blocks
  for (var i = 0; i < blocks.length;i++) {
    
    // this block may have been deleted
    if (blocks[i] && i != blockId) {
      // check to see if one box overlaps the other
      if (x + width < blocks[i].x) continue; // a is left of b
      if (x > blocks[i].x + blocks[i].width) continue; // a is right of b
      if (y + height < blocks[i].y) continue; // a is above b
      if (y > blocks[i].y + blocks[i].height) continue; // a is below b
    
      return true; // boxes overlap
    }
  }
  return false;
}

/*
 * Drawing functions
 */
function draw(index) {
  drawPuzzle();
}

function drawPuzzle() {
  var canvas = document.getElementById('theCanvas');  
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,900,700);

  ctx.strokeStyle = '#FDD017';
  ctx.lineWidth = 4;
  ctx.fillStyle = '#011345';
  ctx.beginPath();
  
  var currentPuzzle = puzzles[currentPuzzleIndex];
  
  var x = currentPuzzle[0][0]*blockSize;
  var y = currentPuzzle[0][1]*blockSize;
  
  ctx.moveTo(x, y);
  // draw lines between each point on the puzzle
  for (var i = 1; i <= currentPuzzle.length; i++) {

    var x = currentPuzzle[i % currentPuzzle.length][0]*blockSize;
    var y = currentPuzzle[i % currentPuzzle.length][1]*blockSize;
    ctx.lineTo(x, y);
  }
  
  ctx.fill();
  ctx.stroke();
}

function debug(message) {
  $('#debug').append(message + '<br />');
}

function odebug(object, indent) {
  if (!indent) {
    var indent = '-';
  }
  
  indent += indent;
  
  for (var i in object) {
    if (typeof object[i] == 'object') {
      debug(indent + i);
      odebug(object[i], indent);
    } else {
      debug(indent + i + ':' + object[i].toString());
    }
  }
}

function mdebug(object) {
  for (var i in object) {
    if (typeof object[i] == 'function') {
      debug(i);
    }
  }
}