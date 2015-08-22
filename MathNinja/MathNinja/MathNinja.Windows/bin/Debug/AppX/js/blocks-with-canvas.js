/*
 * Global variables
 */
var currentBlock = false;
var canvasWidth = 900;
var canvasHeight = 700;
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
  });
  
  $('#previous').attr('disabled', true);
  $('#next').attr('disabled', true);
  
  $('#previous').bind('click', function () {
    blocks = new Array();
    $('#dropZone .droppableBox').remove();
    
    if (currentPuzzleIndex < puzzles.length) {
      $('#next').attr('disabled', false);
    }
    
    currentPuzzleIndex--;
    
    if (currentPuzzleIndex < 0) {
      currentPuzzleIndex = 0;
      $('#previous').attr('disabled', true);
    }
    
    $('#puzzleNumber').html('Puzzle: #' + (currentPuzzleIndex+1));
    
    draw();
  });
  
  $('#next').bind('click', function () {
  
    if (currentPuzzleIndex > 0) {
      $('#previous').attr('disabled', false);
    }
    
    blocks = new Array();
    $('#dropZone .droppableBox').remove();

    currentPuzzleIndex++;
    
    // maximum 25 puzzles to begin with
    if (currentPuzzleIndex > puzzles.length - 1) {
      currentPuzzleIndex = puzzles.length - 1;
    }
    
    if (currentPuzzleIndex < puzzles.length && solvedPuzzles[(currentPuzzleIndex+1)]) {
      $('#next').attr('disabled', false);
    } else {
      $('#next').attr('disabled', true);
    }
    
    $('#puzzleNumber').html('Puzzle: #' + (currentPuzzleIndex+1));
    solvedPuzzles[currentPuzzleIndex] = true;
    draw();
  });
  
  var dragOptions = {};
  dragOptions.helper = "clone";
  dragOptions.opacity = 0.5;
  dragOptions.cursor = "move";
  dragOptions.cursorAt = { top: 30, left: 30 };
  
  
  dragOptions.drag = function(event, ui) {
    var squareSize = $(ui.helper).attr('id').replace('square', '');
    var height = squareSize * 50 - 8;
    var width = squareSize * 50 - 8;
    
    var x = event.pageX;
    var y = event.pageY;
    
    var backgroundColor;
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

  var dropOptions = {};
  dropOptions.accept = ".droppableBox";
  dropOptions.drop = function(event, ui) {
    
    var offset = $('#theCanvas').offset();
    // position of the element, minus the offset, minus the width of the border
    var x = ui.absolutePosition.left - offset.left;
    var y = ui.absolutePosition.top - offset.top;
    var squareSize = $(ui.helper).attr('id').replace('square', '');
    var movingBlock = false;
    
    if (squareSize.charAt(0) == 'b') {
      squareSize = parseInt($(ui.helper).attr('class').replace('droppableBox', '').replace('block-', ''));
      movingBlock = true;
      var blockId = $(ui.helper).attr('id').replace('block-', '');
    }
    
    var height = squareSize * 50 - 8;
    var width = squareSize * 50 - 8;
    
    var backgroundColor;
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
      block += '" class="droppableBox block-' + squareSize + '"></div>';
    
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
    
    if (width != 1 && height != 1) {
      count += height*height*height + width*width*height;
    }
  }
  
  $('#points').html('Points: ' + count);
}

function puzzleIsComplete() {
  createMiniatureCanvas();
  
  // sample the canvas to find the area of the puzzle
  var canvas = document.getElementById('theHiddenCanvas');  
  var ctx = canvas.getContext('2d');
  
  var imgd = ctx.getImageData(0, 0, Math.round(canvasWidth/blockSize), Math.round(canvasHeight/blockSize));
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
  ctx.rect(0, 0, Math.round(canvasWidth/blockSize), Math.round(canvasHeight/blockSize));
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.stroke();
  
  // loop through each block and add it to the diagram
  for (var i = 0; i < blocks.length; i++) {
  
    if (blocks[i]) {
      ctx.beginPath();
      ctx.rect(Math.round(blocks[i].x/blockSize), Math.round(blocks[i].y/blockSize), Math.round(blocks[i].width/blockSize), Math.round(blocks[i].height/blockSize));
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.stroke();
    }
  }
  
  // now re-sample the canvas
  var imgd = ctx.getImageData(0, 0, Math.round(canvasWidth/blockSize), Math.round(canvasHeight/blockSize));
  var pix = imgd.data;
  
  var n;
  var area2 = 0;
  for (var i = 0, n = pix.length; i < n; i += 4) {
    if (pix[i] == 0) {
      area2++;
    }
  }
  
  $('#theHiddenCanvas').remove();
  
  return area1 == area2;
}

function notInsidePuzzle(x, y, width, height) {
  var puzzle = puzzles[currentPuzzleIndex];
  var points = new Array();
  points[0] = [x/blockSize, y/blockSize]; // top left corner
  points[1] = [(x + width)/blockSize, y/blockSize]; // top right corner
  points[2] = [x/blockSize, (y + height)/blockSize]; // bottom left corner
  points[3] = [(x + width)/blockSize, (y + height)/blockSize]; // bottom right corner
  
  // insert the miniature puzzle 
  createMiniatureCanvas();
  
  var canvas = document.getElementById('theHiddenCanvas');  
  var ctx = canvas.getContext('2d');
  
  var imgd = ctx.getImageData(0, 0, Math.round(canvasWidth/blockSize), Math.round(canvasHeight/blockSize));
  var pix = imgd.data;
  
  var n;
  var area1 = 0;
  for (var i = 0, n = pix.length; i < n; i += 4) {
    if (pix[i] == 0) {
      area1++;
    }
  }
  
  ctx.beginPath();
  ctx.rect(points[0][0], points[0][1], Math.round(width/blockSize), Math.round(height/blockSize));
  ctx.fillStyle = '#000000';
  ctx.fill();
  ctx.stroke();
  
  var imgd = ctx.getImageData(0, 0, Math.round(canvasWidth/blockSize), Math.round(canvasHeight/blockSize));
  var pix = imgd.data;
  
  var n;
  var area2 = 0;
  for (var i = 0, n = pix.length; i < n; i += 4) {
    if (pix[i] == 0) {
      area2++;
    }
  }

  $('#theHiddenCanvas').remove();
 
  if (area1 != area2) {
    return true;
  }
 
  return false;
}

function createMiniatureCanvas() {
  // create a new Canvas element
  var canvas = '<canvas id="theHiddenCanvas" width="';
  canvas += Math.round(canvasWidth/blockSize);
  canvas += '" height="';
  canvas += Math.round(canvasHeight/blockSize);
  canvas += '" /></canvas>';
  
  $('#dropZone').append(canvas);
  
  $('#theHiddenCanvas')
    .css('position', 'absolute')
    .css('left', '-9999px');
  
  var canvas = document.getElementById('theHiddenCanvas');  
  var ctx = canvas.getContext('2d');
  
  ctx.beginPath();
  ctx.rect(0, 0, Math.round(canvasWidth/blockSize), Math.round(canvasHeight/blockSize));
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.stroke();
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  
  var currentPuzzle = puzzles[currentPuzzleIndex];
  
  var x = currentPuzzle[0][0];
  var y = currentPuzzle[0][1];
  
  ctx.moveTo(x, y);
  
  // draw lines between each point on the puzzle
  for (var i = 1; i <= currentPuzzle.length; i++) {
    var x = currentPuzzle[i % currentPuzzle.length][0];
    var y = currentPuzzle[i % currentPuzzle.length][1];
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
 * Utility geometry functions
 */
function IsOnSegment(xi, yi, xj, yj, xk, yk) {
  return (xi <= xk || xj <= xk) && (xk <= xi || xk <= xj) &&
         (yi <= yk || yj <= yk) && (yk <= yi || yk <= yj);
}

function ComputeDirection(xi, yi, xj, yj, xk, yk) {
  var a = (xk - xi) * (yj - yi);
  var b = (xj - xi) * (yk - yi);
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Do line segments (x1, y1)--(x2, y2) and (x3, y3)--(x4, y4) intersect? */
function DoLineSegmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  var d1 = ComputeDirection(x3, y3, x4, y4, x1, y1);
  var d2 = ComputeDirection(x3, y3, x4, y4, x2, y2);
  var d3 = ComputeDirection(x1, y1, x2, y2, x3, y3);
  var d4 = ComputeDirection(x1, y1, x2, y2, x4, y4);
  return (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
          ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) ||
         (d1 == 0 && IsOnSegment(x3, y3, x4, y4, x1, y1)) ||
         (d2 == 0 && IsOnSegment(x3, y3, x4, y4, x2, y2)) ||
         (d3 == 0 && IsOnSegment(x1, y1, x2, y2, x3, y3)) ||
         (d4 == 0 && IsOnSegment(x1, y1, x2, y2, x4, y4));
}

// Copyright 2001, softSurfer (www.softsurfer.com)
// This code may be freely used and modified for any purpose
// providing that this copyright notice is included with it.
// SoftSurfer makes no warranty for this code, and cannot be held
// liable for any real or imagined damage resulting from its use.
// Users of this code must verify correctness for their application.

//    a Point is defined by its coordinates {int x, y;}
//===================================================================

// isLeft(): tests if a point is Left|On|Right of an infinite line.
//    Input:  three points P0, P1, and P2
//    Return: >0 for P2 left of the line through P0 and P1
//            =0 for P2 on the line
//            <0 for P2 right of the line
//    See: the January 2001 Algorithm "Area of 2D and 3D Triangles and Polygons"
function isLeft( P0, P1, x, y) {
  var a = ( (P1[0] - P0[0]) * (y - P0[1]) - (x - P0[0]) * (P1[1] - P0[1]) );
  return a;
}

//===================================================================

// wn_PnPoly(): winding number test for a point in a polygon
//      Input:   P = a point,
//               V[] = vertex points of a polygon V[n+1] with V[n]=V[0]
//      Return:  wn = the winding number (=0 only if P is outside V[])
function windingNumber(x, y, polygon){
  var wn = 0;    // the winding number counter

  // loop through all edges of the polygon
  for (var i = 0; i < polygon.length; i++) {   // edge from V[i] to V[i+1]
    //debug(polygon[i][1] + ',' + y);
    if (polygon[i][1] <= y) {         // start y <= P.y
      if (polygon[(i+1) % polygon.length][1] > y) {  // an upward crossing
        if (isLeft(polygon[i], polygon[(i+1) % polygon.length], x, y) > 0) { // P left of edge
          wn++; // have a valid up intersect
        }
      }
    } else {            // start y > P.y (no test needed)
      if (polygon[(i+1) % polygon.length][1] <= y) {    // a downward crossing
        if (isLeft(polygon[i], polygon[(i+1) % polygon.length], x, y) < 0) { // P right of edge
          wn--; // have a valid down intersect
        }
      }
    }
  }
  return wn;
}
//===================================================================
 
function checkLocation(x, y) {
  var minDistance = false;
  var minIndex = -1;
  var distance
  for (var i in locations) {
    distance = d(x, y, locations[i].x + 0.75*locations[i].size, locations[i].y + 0.25*locations[i].size);
    if (distance < locations[i].size) {
      if (distance < minDistance || !minDistance) {
        minDistance = distance;
        minIndex = i;
      }
    }
  }

  return minIndex;
}

function d(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2));
}


/*
 * Drawing functions
 */
function draw(index) {
  //var canvas = document.getElementById('theCanvas');  
  //var ctx = canvas.getContext('2d');
  
  // clear the canvas
  //
  
  // draw the background
  // drawBackground();
  
  // draw the current puzzle
  drawPuzzle();
}

function drawBackground() {
  var canvas = document.getElementById('theCanvas');  
  var ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 2;
  //ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  
  // horizontal lines
  for (var i = 0; i <= canvasHeight/blockSize; i++) {
    ctx.dashedLine(0, blockSize*i, canvasWidth, blockSize*i);
  }
  
  // vertical lines
  for (var i = 0; i <= canvasWidth/blockSize; i++) {
    ctx.dashedLine(blockSize*i, 0, blockSize*i, canvasHeight);
  }
  
  //ctx.fill();
  ctx.stroke();
}

function drawPuzzle() {
  var canvas = document.getElementById('theCanvas');  
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,900,700);

  ctx.strokeStyle = '#FDD017';
  ctx.lineWidth = 4;
  ctx.fillStyle = '#FFFFFF';
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