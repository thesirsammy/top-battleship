// ! Overall, pretty broken and probably need to start over.

export class Ship {
  constructor(coordsArray, shipLength) {
    this.coordsArray = coordsArray; // A 2D array, each inside array being a coordinate
    this.shipLength = shipLength; 
    this.hitCount = 0;
  }

  hit() {
    this.hitCount = this.hitCount+1;
  }

  hasSunk() {
    return (this.coordsArray.length == this.hitCount);
  }
}

export class Gameboard {
  constructor() {
    this.otherPlayer;
    this.ships = [];  // Array holding each Ship
    this.hits = [];  // Array holding all hit shots
    this.missed = [];   // Array holding all missed shots
    this.sinks = 0;
  }

  /**
   * Randomly sets up the battleship board for a player. 
   */
  generateBoard() {
    const directions = ["horizontal", "vertical"]; // Possible directions for the ships
    const boardSize = 10; // Size of the board (10x10)
    const shipLengths = [5, 4, 3, 3, 2]; // Lengths of the ships to place
    const placedShips = [];
    const buffer = new Set(); // Tracks all coordinates in the buffer zone
  
    const isValidPlacement = (coords) => {
      // Check if the coordinates are within bounds, don't overlap with ships, and avoid the buffer zone
      return coords.every(([x, y]) => {
        if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) return false;
        const coordKey = `${x},${y}`;
        return (
          !placedShips.some(ship =>
            ship.some(([sx, sy]) => sx === x && sy === y)
          ) && !buffer.has(coordKey) // Avoid buffer zone
        );
      });
    };
  
    const generateShipCoords = (length, direction, startX, startY) => {
      // Generate coordinates for a ship based on its starting position and direction
      const coords = [];
      for (let i = 0; i < length; i++) {
        if (direction === "horizontal") coords.push([startX, startY + i]);
        if (direction === "vertical") coords.push([startX + i, startY]);
      }
      return coords;
    };
  
    const addToBuffer = (coords) => {
      // Add a buffer zone around the given coordinates
      const directions = [-1, 0, 1]; // Check adjacent cells
      coords.forEach(([x, y]) => {
        directions.forEach(dx => {
          directions.forEach(dy => {
            const bufferX = x + dx;
            const bufferY = y + dy;
            if (bufferX >= 0 && bufferX < boardSize && bufferY >= 0 && bufferY < boardSize) {
              buffer.add(`${bufferX},${bufferY}`);
            }
          });
        });
      });
    };
  
    for (let length of shipLengths) {
      let placed = false;
      while (!placed) {
        const direction = directions[this.getRndInteger(0, 2)]; // Randomly choose a direction
        const startX = this.getRndInteger(0, boardSize); // Random starting X position
        const startY = this.getRndInteger(0, boardSize); // Random starting Y position
  
        const coords = generateShipCoords(length, direction, startX, startY);
  
        if (isValidPlacement(coords)) {
          placedShips.push(coords);
          this.placeShip(coords, length); // Add the ship to the board
          addToBuffer(coords); // Mark the buffer zone around the placed ship
          placed = true;
        }
      }
    }
  }

  /**
   * Adds a ship to the ships array. Requires a 2D array (Array of ship's coordinates,
   * also arrays)
   * 
   * @param {Array} coordsArray
   */
  placeShip(coordsArray, shipLength) {
    this.ships.push(new Ship(coordsArray, shipLength));
  }

  /**
   * Returns whether or not given coordinate is already a hit.
   * @param {Array} coord
   * @returns {Boolean}
   */
  isHit(coord) {
    let isHit = false;
    for (let hit of this.hits)
      if (JSON.stringify(hit) === JSON.stringify(coord))
        isHit = true;

    return isHit;
  }

  /**
   * Returns whether or not given coordinate is already a miss.
   * @param {Array} coord
   * @returns {Boolean}
   */
  isMiss(coord) {
    let isMiss = false;
    for (let miss of this.missed)
      if (JSON.stringify(miss) === JSON.stringify(coord))
        isMiss = true;
    
    return isMiss;
  }

  isShip(coord) {
    let isShip = false;
    for (let ship of this.ships)
      for (let shipCoord of ship.coordsArray)
        if (JSON.stringify(shipCoord) === JSON.stringify(coord))
          isShip = true;
    
    return isShip;
  }

  getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }


  /**
  * If input coordinate matches a coordinate of a ship, adds it to the list
  * of hit coordinates and adds a count to the ships number of hits.
  * @param {Array} coord
  */
  receiveAttack(coord, cell, otherPlayer) {
    let found = false;
  
    for (let ship of this.ships) {
      for (let shipCoord of ship.coordsArray) {
        if (JSON.stringify(coord) === JSON.stringify(shipCoord)) {
          this.hits.push(coord);
          ship.hit();
          found = true;
          
          break;
        }
      }
      if (found) break;
    }
  
    if (!found) {
      this.missed.push(coord);

    }
  
    if (this.isGameOver()) {
      console.log('game over!')
    }
  }
 
  isGameOver() {
    return this.ships.every(ship => ship.hasSunk());
  }
}

export class Player {
  constructor(playerName, playerID, isActive) {
    this.playerName = playerName;
    this.playerID = playerID;
    this.isActive = isActive;
    this.board = new Gameboard();
  }

  /**
   * Displays a player's board, accounting for hits, misses, and ships.
  */
  render() {
    const boardDOM = document.getElementById(`board${this.playerID}`);
    boardDOM.innerHTML = "";
    for (let i = 0; i < 10; i++) {
      const row = document.createElement('div');
      row.classList.add('board-row');
      row.id = i;
      for (let j = 9; j >= 0; j--) {
        const cell = document.createElement('div');
        cell.classList.add('cell')
        cell.id = j;

        if (this.board.isShip([i, j]))
          for (let ship of this.board.ships)
            for (let coord of ship.coordsArray)
              if ((coord[0] == row.id) && (coord[1] == cell.id)) {
                cell.classList.add('ship');
              }

        if (this.board.isHit([i, j]))
          for (let hit of this.board.hits)
            if ((hit[0] == row.id) && (hit[1]) == cell.id) {
              cell.classList.add('hit');
              break
            }

        if (this.board.isMiss([i, j])) {
          for (let miss of this.board.missed)
            if ((miss[0] == row.id) && (miss[1] == cell.id)) {
              cell.classList.add('miss');
              break
            }
        }
        
        if(this.isActive) {
          if (!this.board.isHit([i, j]) && !this.board.isMiss([i, j])) {
            cell.addEventListener('click', () => {
              this.isActive = !this.isActive;
              this.otherPlayer.isActive = !this.otherPlayer.isActive;

              this.board.receiveAttack([i, j], cell, this.otherPlayer);
              this.render(this.playerID)
              this.otherPlayer.render(this.otherPlayer.playerID)
            });
          }
        }
        
        row.appendChild(cell);
      }
      boardDOM.appendChild(row);
    }
  }
}

export class CPU extends Player {
  waitForAttack(i, j, cell) {
    console.log('hey');
    this.board.receiveAttack([this.board.getRndInteger(0, 9), this.board.getRndInteger(0, 9)], cell);
    this.otherPlayer.render();
  }

  selectCoord() {
    const randCoord = [this.board.getRndInteger(0, 9), this.board.getRndInteger(0, 9),]
    console.log(randCoord);

    this.otherPlayer.board.receiveAttack(randCoord);
  }
}

export class Viewport {
  constructor() {
  }

  initCPU() {

  }

  init() {
    const player1 = new Player('Phil', 0, false);
    const player2 = new Player('Jones', 1, true);

    player1.otherPlayer = player2;
    player2.otherPlayer = player1;

    player1.board.generateBoard();
    player2.board.generateBoard();

    player1.render(0);
    player2.render(1)

    const renderStartMenu = () => {

    }
  }

}
