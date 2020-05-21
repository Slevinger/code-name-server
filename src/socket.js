const gamesControl = require("./services/gamesControl");
const socketio = require("socket.io");

//server

const Socket = server => {
  const io = socketio(server);

  const gameChange = (gameId, options) => {
    io.to(gameId).emit("gameChange", options);
  };

  io.on("connection", socket => {
    try {
      socket.on("joinGame", ({ nickname, gameId }, callback) => {
        const { error, game } = gamesControl.joinGame(
          gameId,
          nickname,
          socket.id
        );
        if (error) {
          return callback(error);
        }
        socket.join(gameId);
        gameChange(gameId, game);
        callback();
      });

      socket.on("createGame", ({ nickname }, callback) => {
        console.log(nickname);
        const game = gamesControl.createGame(nickname);
        socket.join(game.gameId);
        gamesControl.joinGame(game.gameId, nickname, socket.id);
        gameChange(game.gameId, game);

        callback();

        // res.send(game.gameId);
      });

      socket.on("startGame", ({ gameId }) => {
        const game = gamesControl.getGame(gameId);

        gamesControl.startGame(gameId);
        gameChange(gameId, game);

        // callback();

        // res.send(game.gameId);
      });
      socket.on("setClue", ({ gameId, numberOfWords, clue }) => {
        const game = gamesControl.getGame(gameId);
        game.setClue(clue);
        game.setNumberOfWords(numberOfWords);
        gameChange(gameId, game);
      });

      socket.on("chooseTeam", ({ gameId, teamColor, nickname, role }) => {
        const game = gamesControl.getGame(gameId);
        game.joinTeam(teamColor, nickname, role);
        gameChange(gameId, game);
      });

      socket.on("togglePlayerReady", ({ gameId, nickname }) => {
        const game = gamesControl.getGame(gameId);
        game.togglePlayerReady(nickname);
        gameChange(gameId, game);
      });

      socket.on("cellSelected", ({ gameId, nickname, cellIndexes }) => {
        const game = gamesControl.getGame(gameId);
        const { players, teams } = game;

        const player = players[nickname];
        if (player) {
          player.selectedCell =
            cellIndexes === player.selectedCell ? null : cellIndexes;
          const shoulShowColor =
            game.teams[player.teamColor].players.filter(nick => players[nick])
              .length ===
            teams[player.teamColor].players.reduce((acc, nick) => {
              return (
                acc +
                (players[nick] && players[nick].selectedCell === cellIndexes
                  ? 1
                  : 0)
              );
            }, 0);
          if (shoulShowColor) {
            game.colorCell(cellIndexes);
            game.resetClicks();
            if (game.board[cellIndexes].color === "black") {
              // player.teamColor lose
            } else if (game.board[cellIndexes].color === player.teamColor) {
              game.setNumberOfWords(game.numberOfWords - 1);
            } else {
              game.setNumberOfWords(0);
            }
            if (game.numberOfWords <= 0) {
              game.switchTeams();
            }
          }
          gameChange(gameId, game);
        }

        // see if all players in the team have the same selected cell
        // if so color it if it is colored change turn
        //
      });

      socket.on("sendMessage", ({ gameId, nickname, message }, callback) => {
        io.to(gameId).emit("message", { nickname, message });
        callback();
      });
      console.log("new web socket connection");

      socket.on("disconnect", reason => {
        // const game = gamesControl.Sockets(socket.id);
        const { game, error } = gamesControl.leaveGame(socket.id);
        if (game) {
          io.to(game.gameId).emit("gameChange", game);
        }
        console.log(game);
        console.log(error);
        // if (!error) {
        //   io.to(game.gameId).emit("gameChange", game);
        //   io.emit("message", "a user has left");
        // }
      });
    } catch (e) {
      console.log(e);
    }
  });

  return io;
};

module.exports = { Socket };
