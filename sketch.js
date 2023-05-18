
class CostTracker {
  constructor(i, j) {
    this.i = i; // x pos;
    this.j = j; // y pos;
    this.f = 0; // totalCost;
    this.g = 0; // costFromStart;
    this.h = 0; // heuristicCost;
    this.neighbours = new Array();
    this.previousCell = null;
    this.wall = false; // Math.random(1) < 0.4;

    this.show = function(colour) {
      fill(colour);
      noStroke();
      ellipse(this.i * w + w / 2, this.j * h + h / 2, w / 2, h / 2);
      // rect(this.i * w, this.j * h, w-1, h-1);
    }

    this.addNeighbours = function(currentGrid) {
      const { i, j, neighbours, wall } = this;

      // check if valid neighbour and add to array if yes
      if (!wall) {
        // straight
        if (i < colCount - 1) neighbours.push(currentGrid[i + 1][j]);
        if (i > 0) neighbours.push(currentGrid[i - 1][j]);
        if (j < rowCount - 1) neighbours.push(currentGrid[i][j + 1]);
        if (j > 0) neighbours.push(currentGrid[i][j - 1]);
        // diagonals
        if (i < colCount - 1 && j > 0) neighbours.push(currentGrid[i + 1][j - 1]);
        if (i > 0 && j > 0) neighbours.push(currentGrid[i - 1][j - 1]);
        if (i < colCount - 1 && j < rowCount - 1) neighbours.push(currentGrid[i + 1][j + 1]);
        if (i > 0 && j < rowCount - 1) neighbours.push(currentGrid[i - 1][j + 1]);
      }
    }
  }
}

// globals
var openSet = new Array();
var closedSet = new Array();
var completedPath = new Array();
var isSolvable = true;
var startCell;
var currentCell;
var endCell;
var w;
var h;

const colCount = 60;
const rowCount = 60;
const grid = createGrid();

// !!!!!!!!!!!!!!!!!!!! START
startCell = grid[0][0];
startCell.wall = false;
endCell = grid[colCount - 1][rowCount -1];
endCell.wall = false;

openSet.push(startCell);

console.log('grid: ', grid);
console.log('openSet: ', openSet);
console.log('closedSet: ', closedSet);

// p5js
function setup() {
  createCanvas(400, 400);

  w = width / colCount;
  h = height / rowCount;
}

function draw() {
  if (openSet.length) {
    let winner = 0;

    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[winner].f) {
        winner = i;
      }
    }

    currentCell = openSet[winner];

    // !!!!!!!!!!!!!!!!!!!! DONE
    if (currentCell == endCell) {
      console.log('grid: ', grid);
      console.log('openSet: ', openSet);
      console.log('closedSet: ', closedSet);
      console.log('completedPath: ', completedPath);
      console.log("PATH-ED!");

      noLoop();
    }

    // manage tracking arrays
    removeCellFromArray(openSet, currentCell);
    closedSet.push(currentCell);

    for (let i = 0; i < currentCell.neighbours.length; i++) {
        const neighbour = currentCell.neighbours[i];

        if (!closedSet.includes(neighbour)) {
          // set g score
          const tempG = currentCell.g + 1;
          let cellIsBetterPath = false;

          if (openSet.includes(neighbour)) {
            if (tempG < neighbour.g) {
              cellIsBetterPath = true;
              neighbour.g  = tempG;
            }
          } else {
            cellIsBetterPath = true;
            neighbour.g = tempG;
            openSet.push(neighbour);
          }

          if (cellIsBetterPath) {
            neighbour.h = calcHeuristic(neighbour, endCell);
            neighbour.f = neighbour.g + neighbour.h;
            neighbour.previousCell = currentCell;
          }
        }
    }

  } else {
    console.log('No possible path found.');
    noLoop();
    return;
  }

  // draw
  background(255);

  if (grid) {
    for (let i = 0; i < colCount; i++) {
      for (let j = 0; j < rowCount; j++) {
        const selectedCell = grid[i][j];

        if (selectedCell.wall) {
          selectedCell.show(color(0));
        } else {
          // selectedCell.show(color(255));

          if (closedSet.includes(selectedCell)) {
            selectedCell.show(color(255,0,0));
          }

          if (openSet.includes(selectedCell)) {
            selectedCell.show(color(0,255,0));
          }
        }
      }
    }

    // Find path taken
    completedPath = [];
    let temp = currentCell;

    completedPath.push(temp);

    while (temp.previousCell) {
      completedPath.push(temp.previousCell);
      // temp.show(color(0,0,255)); // colour completed path
      temp = temp.previousCell;
    }

    noFill();
    stroke(255,0,200)
    strokeWeight(w / 2);
    beginShape();
    for (let i = 0; i < completedPath.length; i++) {
      vertex(completedPath[i].i * w + w / 2, completedPath[i].j * h + h / 2);
    }
    endShape();

    startCell.show(color(255,255,0));
    endCell.show(color(0,255,255));
  }
}

function createGrid() {
  const g = new Array(colCount);

  for (let i = 0; i < colCount; i++) {
    g[i] = new Array(rowCount);
  }

  // populate cells
  for (let i = 0; i < colCount; i++) {
    for (let j = 0; j < rowCount; j++) {
      g[i][j] = new CostTracker(i, j);
    }
  }

  // populate neighbouring cell info
  for (let i = 0; i < colCount; i++) {
    for (let j = 0; j < rowCount; j++) {
      g[i][j].addNeighbours(g);
    }
  }

  return g
}

function removeCellFromArray(arr, cell) {
  for (let i = arr.length; i >= 0; i--) {
    if (arr[i] === cell) {
      arr.splice(i, 1);
      return;
    }
  }
}

function calcHeuristic(a, b) {
  // euclidian distance
  return dist(a.i, a.j, b.i, b.j);

  // manhattan distance
  //return abs(a.i - b.i) + abs(a.j - b.j);
}

