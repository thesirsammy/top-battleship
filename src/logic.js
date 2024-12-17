// TODO Split up methods in Gameboard class so they're not all in one Class

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
          cell.classList.add('hit');
          found = true;
        
          break;
        }
      }

      if (found) break;
    }

    if (!found) {
      this.missed.push(coord);
      cell.classList.add('miss');
    }

    otherPlayer.render();

    if (this.isGameOver()) {
      console.log('game over!')
    }
  }

  isGameOver() {
    for (let ship of this.ships)
      if (!ship.hasSunk()) {
        console.log('not over');
        return false;
      }

    console.log('game over!')
    return false;
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
   * Displays a player's board, accounting for hits, misses, and ships.
  */
  render() {
    const boardDOM = document.getElementById('board');
    boardDOM.innerHTML = "";
    for (let i = 0; i < 10; i++) {
      const row = document.createElement('div');
      row.classList.add('board-row');
      row.id = i;
      for (let j = 9; j >= 0; j--) {
        const cell = document.createElement('div');
        cell.classList.add('cell')
        cell.id = j;

        if (this.isShip([i, j]))
          for (let ship of this.ships)
            for (let coord of ship.coordsArray)
              if ((coord[0] == row.id) && (coord[1] == cell.id)) {
                cell.classList.add('ship');
              }

        if (this.isHit([i, j]))
          for (let hit of this.hits)
            if ((hit[0] == row.id) && (hit[1]) == cell.id) {
              cell.classList.add('hit');
              break
            }

        if (this.isMiss([i, j])) {
          for (let miss of this.missed)
            if ((miss[0] == row.id) && (miss[1] == cell.id)) {
              cell.classList.add('miss');
              break
            }
        }

        if (!this.isHit([i, j]) && !this.isMiss([i, j]))
          cell.addEventListener('click', () => (this.receiveAttack([i, j], cell, this.otherPlayer)));
        
        row.appendChild(cell);
      }
      boardDOM.appendChild(row);
    }
  }
}

export class Player {
  constructor(playerName) {
    this.playerName = playerName;
  }
}

export class CPU extends Player {
  
}

export class Viewport {
  constructor() {
    this.player1 = new Gameboard();
    this.player2 = new Gameboard();
    // this.activePlayer = player1;
  }

  init() {
    this.player1.playerName = "Phil";
    this.player2.playerName = "George";

    this.player1.otherPlayer = this.player2;
    this.player2.otherPlayer = this.player1;

    this.player1.generateBoard();
    this.player2.generateBoard();

    this.player1.render();

    const renderStartMenu = () => {

    }
  }

}
