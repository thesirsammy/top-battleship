import { Gameboard } from './gameboard.js';

describe('Gameboard', () => {
  let gameboard;

  beforeEach(() => {
    gameboard = new Gameboard();
  });

  test('Gameboard initializes correctly', () => {
    expect(gameboard.ships).toEqual([]);
    expect(gameboard.hits).toEqual([]);
    expect(gameboard.missed).toEqual([]);
  });

  test('placeShip adds a ship to the board', () => {
    const shipCoords = [[0, 0], [0, 1], [0, 2]];
    gameboard.placeShip(shipCoords, shipCoords.length);
    expect(gameboard.ships.length).toBe(1);
  });

  test('receiveAttack registers a hit on a ship', () => {
    const shipCoords = [[0, 0], [0, 1], [0, 2]];
    gameboard.placeShip(shipCoords, shipCoords.length);

    gameboard.receiveAttack([0, 1]);
    expect(gameboard.hits).toContainEqual([0, 1]);
  });

  test('receiveAttack registers a miss', () => {
    gameboard.receiveAttack([5, 5]);
    expect(gameboard.missed).toContainEqual([5, 5]);
  });
});