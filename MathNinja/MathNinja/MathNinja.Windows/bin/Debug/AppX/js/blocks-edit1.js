var currentBlock = false;
var canvasWidth = 900;
var canvasHeight = 700;
var blockSize = 50;
var currentPuzzleIndex = 0;
var blocks = new Array();

$(document).ready(function () {
  draw();
  
  $('#theCanvas').bind('mousemove', function (event) {

    var x = event.pageX;
    var y = event.pageY;
    
    // redraw the screen
    draw();
    
  });
  
  $('#theCanvas').bind('mousedown', function (event) {
    var x = event.pageX;
    var y = event.pageY;
    
  });
  
  $('#theCanvas').bind('mouseup', function (event) {
    snapBlockToGrid(currentBlock.index);
    currentBlock = false;
    $('#theCanvas').css('cursor', 'pointer');
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
    
    //debug(x + ',' + y);
    
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
  
  dropOptions.drop = function( event, ui ) {
    
    var offset = $('#theCanvas').offset();
    // position of the element, minus the offset, minus the width of the border
    var x = ui.absolutePosition.left - offset.left;
    var y = ui.absolutePosition.top - offset.top;
    var squareSize = $(ui.helper).attr('id').replace('square', '');
    var height = squareSize * 50 - 8;
    var width = squareSize * 50 - 8;
    
    //alert(squareSize);
    
    var xMouse = event.pageX;
    var yMouse = event.pageY;
    
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
    
    //debug(x + ',' + y);
    
    // first round off the positions
    x = Math.round(x/blockSize)*blockSize;
    y = Math.round(y/blockSize)*blockSize;
    
    // first check that the block is inside the puzzle
    if (insidePuzzle(x, y, width, height)) {
      return;
    }
    
    // now check that there is no overlap with another existing block
    if (noOverlap(x, y, width, height)) {
      return;
    }
    
    // now add the block with appropriate
    blocks[blocks.length] = {'x': x, 'y': y, 'width': width, 'height': height};
    
    var left = x + 'px';
    var top = y + 'px';
    
    var block = '<div id="block-';
    block += blocks.length;
    block += '" style="border: 4px solid gold; display: block; width: ';
    block += width + '; height: ';
    block += height;
    block += ';position: absolute; left: ';
    block += left;
    block += '; top: ';
    block += top;
    block += ';background-color: ';
    block += backgroundColor;
    block += '"></div>';
    
    // now check to see if this is the last block to be added
    // perhaps comparing the area covered with the area of the polygon?
    if (polygonCovered()) {
    
      // end of puzzle routine
      
    }
    
    $('#dropZone').append(block);
	}
  
  $('#dropZone').droppable(dropOptions);
});

/*
 * Game related functions
 */
function insidePuzzle(x, y, width, height) {
  var puzzle = puzzles[currentPuzzleIndex];
  var points = new Array();
  points[0] = [x/blockSize, y/blockSize]; // top left corner
  points[1] = [(x + width)/blockSize, y/blockSize]; // top right corner
  points[2] = [x/blockSize, (y + height)/blockSize]; // bottom left corner
  points[3] = [(x + width)/blockSize, (y + height)/blockSize]; // bottom right corner
  
  // first check to see if each corner of the rectangle is 
  // inside a rectangle that bounds the region described by the coordinates
  var Xmin, Xmax, Ymin, Ymax;
  
  // find the minimum and maximum points for the polygon
  for (var i = 0; i < puzzle.length; i++) {
    Xmin = Math.min(puzzle[i][0], Xmin) ? Math.min(puzzle[i][0], Xmin) : puzzle[i][0];
    Xmax = Math.max(puzzle[i][0], Xmax) ? Math.max(puzzle[i][0], Xmax) : puzzle[i][0];
    Ymin = Math.min(puzzle[i][1], Ymin) ? Math.min(puzzle[i][1], Ymin) : puzzle[i][1];
    Ymax = Math.max(puzzle[i][1], Ymax) ? Math.max(puzzle[i][1], Ymax) : puzzle[i][1];
  }
  
  // this is the fast check, is it inside a bounding rectangle around the polygon?
  for (i = 0; i < points.length; i++) {
  
    // check to see if the point on the rectangle is inside the bounded rectangle of the polygon
    if (points[i][0] < Xmin || points[i][0] > Xmax || points[i][1] < Ymin || points[i][1] > Ymax) {
      // Definitely not within the polygon!
      return true;
    }
  }
  
  
  for (i = 0; i < points.length; i++) {
    if(windingNumber(points[i][0], points[i][1], puzzle) == 0) {
      return true;
    }
  }
  
  return false;
}

function noOverlap(x, y, width, height) {

  // check to see if the current block overlaps with any of the existing blocks
  for (var i = 0; i < blocks.length;i++) {
    
    // check to see if one box overlaps the other
    if (x + width < blocks[i].x) continue; // a is left of b
    if (x > blocks[i].x + blocks[i].width) continue; // a is right of b
    if (y + height < blocks[i].y) continue; // a is above b
    if (y > blocks[i].y + blocks[i].height) continue; // a is below b
    
    return true; // boxes overlap
  }
  return false;
}

function polygonCovered() {
  var puzzle = puzzles[currentPuzzleIndex];
  var i, j, k;
  
  // application of Pick's theorem
  // count how many points are inside the polygon
  var pointsInside = 0;
  var pointsOnEdge = 0;
  
  // how many points are inside, or on the edge of the polygon?
  for (i = 0; i < canvasWidth/blockSize; i++) {  
    for (j = 0; j < canvasHeight/blockSize; j++) {
      
      if (windingNumber(i, j, puzzle)*1) {
        debug(i + ',' + j);
        pointsInside++;
      }
    }
  }
  
  // how many points are on the edge of the polygon?
  for (i = 0; i < canvasWidth/blockSize; i++) {  
    for (j = 0; j < canvasHeight/blockSize; j++) {
      
      // loop through each edge of the polygon
      for (k = 0; k < puzzle.length; k++) {
        
        // is this a vertical edge and does the x value of the point match the x value of the edge?
        if (puzzle[k][0] == puzzle[(k+1)%puzzle.length][0] && i == puzzle[k][0]) {
          
          // now check to see if the y value falls between the two y values of the edge
          if ((j >= puzzle[k][1] && j <= puzzle[(k+1)%puzzle.length][1]) || (j <= puzzle[k][1] && j >= puzzle[(k+1)%puzzle.length][1])) {
            pointsOnEdge++;
          }
        }
        
        // is this a horizontal edge and does the y value of the point match the y value of the edge?
        if (puzzle[k][1] == puzzle[(k+1)%puzzle.length][1] && j == puzzle[k][1]) {
          
          // now check to see if the x value falls between the two x values of the edge
          if ((i >= puzzle[k][0] && i <= puzzle[(k+1)%puzzle.length][0]) || (i <= puzzle[k][0] && i >= puzzle[(k+1)%puzzle.length][0])) {
            pointsOnEdge++;
          }
        }
      }
    }
  }
  
  // correct for double counting of vertices, which are in two line-segments
  // this may be problematic if any of the puzzles double back on each other
  // so a more sophisticated algorithm may be necessary in this case
  pointsOnEdge = pointsOnEdge - puzzle.length;
  
  debug(pointsOnEdge + ',' + pointsInside);
  
  // now correct the number of interior points
  pointsInside = pointsInside - pointsOnEdge;
  
  // now find the area of the polygon
  

}

/*
 * Utility geometry functions
 */

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
  return ((P1[0] - P0[0]) * (y - P0[1]) - (x - P0[0]) * (P1[1] - P0[1]));
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
  var canvas = document.getElementById('theCanvas');  
  var ctx = canvas.getContext('2d');
  
  // clear the canvas
  ctx.clearRect(0,0,900,700);
  
  // draw the background
  drawBackground();
  
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
  //ctx.strokeStyle = '#3333ff';
  ctx.strokeStyle = '#FDD017';
  ctx.lineWidth = 4;
  //ctx.fillStyle = '#ffffff';
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
  
  //ctx.fill();
  ctx.stroke();
}

function drawBlock(x, y, size, forecolor, backcolor, width) {
  var canvas = document.getElementById('theCanvas');  
  var ctx = canvas.getContext('2d');
  ctx.strokeStyle = forecolor;
  ctx.lineWidth = width;
  ctx.fillStyle = backcolor;
  ctx.beginPath();
  
  // front face
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y);
  ctx.fill();
  ctx.stroke();  
  
  // top face
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 0.5*size, y - 0.5*size);
  ctx.lineTo(x + 1.5*size, y - 0.5*size);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y);
  ctx.fill();
  ctx.stroke();  
  
  // side face
  ctx.beginPath();
  ctx.moveTo(x + size, y + size);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + 1.5*size, y - 0.5*size);
  ctx.lineTo(x + 1.5*size, y + 0.5*size);
  ctx.lineTo(x + size, y + size);
  ctx.fill();
  ctx.stroke();
}

function drawLine(x1, y1, x2, y2, color, width, ctx) {
  if (!width) {
    width = 2;
  }
  
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
}

// Draws dashed lines
var CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
if (CP && CP.lineTo) {
    CP.dashedLine = function(x, y, x2, y2, da) {
        if (!da) da = [10,5];
        this.save();
        var dx = (x2-x), dy = (y2-y);
        var len = Math.sqrt(dx*dx + dy*dy);
        var rot = Math.atan2(dy, dx);
        this.translate(x, y);
        this.moveTo(0, 0);
        this.rotate(rot);       
        var dc = da.length;
        var di = 0, draw = true;
        x = 0;
        while (len > x) {
            x += da[di++ % dc];
            if (x > len) x = len;
            draw ? this.lineTo(x, 0): this.moveTo(x, 0);
            draw = !draw;
        }       
        this.restore();
    }
}

function debug(message) {
  $('#debug').append(message + '<br />');
}

function odebug(object) {
  for (var i in object) {
    
    if (typeof object == 'object') {
      odebug(object[i]);
    } else {
      debug(object);
    }
  }
}