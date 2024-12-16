import "./styles.css";
import { Viewport, Player, Gameboard, Ship } from "./logic";

const game = new Viewport();

game.player1.playerName = "Phil";
game.player2.playerName = "George";

//game.player1.board.placeShip([[9, 0], [8, 0]]);

// game.player2.board.placeShip([[5, 3], [5, 4], [5, 5]])

// game.player2.board.receiveAttack([5, 0])
// game.player2.board.receiveAttack([5, 3])

game.player2.board.generateBoard();

game.player2.render();