const Game = require("./Game");

const games = {};
const users = {};
const sockets = {};
const gameOptions = { red: 9, blue: 8 };
// create game

const createGame = gameAdmin => {
  const game = new Game(gameAdmin);
  games[game.gameId] = game;
  return game;
};

const startGame = gameId => {
  if (games[gameId]) {
    games[gameId].createBoard(gameOptions);
  }
};

const joinGame = (gameId, nickname, id) => {
  if (games[gameId]) {
    games[gameId].joinGame(nickname, id);
    users[id] = { game: games[gameId], nickname: nickname };
    return { game: games[gameId] };
  }
  return {
    error: "game does not exist"
  };
};

const leaveGame = id => {
  if (users[id]) {
    const { game, nickname } = users[id];
    game.leaveTeam(nickname);
    game.leaveGame(nickname);

    return { game };
    // games[game.gameId].leaveGame(user.nickname);
  }
  return { error: "no such user" };
};

const leaveTeam = (gameId, nickname) => {
  games[gameId].leaveTeam(nickname);
};

const joinTeam = (gameId, teamColor, nickname, role) => {
  const game = games[gameId];
  game.joinTeam(teamColor, nickname, role);
  return game;
};

const createBoard = gameId => {
  const game = games[gameId];
  game.createBoard(gameOptions);

  return game;
};

const getGame = gameId => games[gameId];

const Sockets = socketId => (socketId ? sockets[socketId] : sockets);

module.exports = {
  createBoard,
  createGame,
  joinGame,
  leaveGame,
  leaveTeam,
  joinTeam,
  getGame,
  Sockets,
  startGame
};

// remove game

// add player to game

// remove player from game
