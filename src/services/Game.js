const createBoard = require("./createBoard");

const newTeam = () => ({
  score: 0,
  players: []
});

class Game {
  gameId;
  teams;
  players;
  playersHistory;
  gameAdmin;
  whosTurn;
  numberOfWords;
  hinters;
  clue;
  extraGuess;
  otherTeam;
  options;

  constructor(gameAdmin) {
    this.gameId = Math.random()
      .toString(36)
      .slice(2)
      .toUpperCase();
    this.players = {};
    this.teams = {
      red: newTeam(),
      blue: newTeam()
    };
    this.hinters = [];
    this.playersHistory = {};
    this.gameAdmin = gameAdmin;
  }

  joinGame(nickname) {
    if (this.playersHistory[nickname]) {
      this.players[nickname] = this.playersHistory[nickname];
    } else {
      if (!this.players[nickname]) {
        const teamColor = Object.keys(this.teams).filter(teamColor =>
          this.teams[teamColor].players.includes(nickname)
        )[0];
        this.players[nickname] = {
          nickname,
          selectedCell: false,
          isHinter: this.hinters.includes(nickname),
          teamColor,
          isReady: false
        };
        this.playersHistory[nickname] = this.players[nickname];
      }
    }

    return this.players[nickname];
  }

  joinTeam(teamColor, nickname, role) {
    const player = this.players[nickname];
    const team = this.teams[teamColor];
    console.log(this.teams);
    if (player) {
      if (player.teamColor) {
        this.leaveTeam(nickname);
      }
      player.teamColor = teamColor;
      player.isHinter = role === "hinter";
      if (!team.players.includes(nickname) && !player.isHinter) {
        team.players.push(nickname);
      }
      if (player.isHinter) {
        this.hinters.push(nickname);
      }
    }
  }

  setClue(clue) {
    this.clue = clue;
  }
  setNumberOfWords(numberOfWords) {
    this.numberOfWords = numberOfWords;
  }

  colorCell(cellIndexes) {
    if (this.board) {
      this.board[cellIndexes].showColor = true;
      this.board[cellIndexes].flipTeam = this.whosTurn;
      this.teams[this.whosTurn].score +=
        this.board[cellIndexes].color === this.whosTurn ? 1 : 0;
    }
  }

  resetClicks() {
    Object.values(this.players).forEach(player => {
      player.selectedCell = false;
    });
  }

  switchTeams() {
    const nextTeam = this.otherTeam;
    this.otherTeam = this.whosTurn;
    this.whosTurn = nextTeam;
    this.setClue("");
    this.setNumberOfWords(0);
  }

  setGameAdmin({ nickname }) {
    this.gameAdmin = nickname;
  }

  togglePlayerReady = nickname => {
    this.players[nickname].isReady = !this.players[nickname].isReady;
  };

  leaveTeam(nickname) {
    const player = this.players[nickname];
    if (player && player.teamColor) {
      const indexInTeam = this.teams[player.teamColor].players.indexOf(
        nickname
      );
      if (indexInTeam >= 0) {
        this.teams[player.teamColor].players.splice(indexInTeam, 1);
      }
      player.teamColor = null;
    }
  }

  leaveGame(nickname) {
    delete this.players[nickname];
    // if (this.gameAdmin === nickname && Object.values(this.players).length > 0) {
    //   this.setGameAdmin(Object.values(this.players)[0]);
    // }
  }
  createBoard(options) {
    this.whosTurn = "red";
    this.otherTeam = "blue";
    this.board = createBoard(options);
    this.options = options;
  }
}

module.exports = Game;
