const express = require("express");
const http = require("http");
const cors = require("cors");
const gamesControl = require("./services/gamesControl");
const { Socket } = require("./socket");
const app = express();
const server = http.createServer(app);

const io = Socket(server);
const port = process.env.PORT || 3000;

app.set("port", port);

app.use(express.json());
app.use(cors());
app.all("*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST , OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/", (req, res) => {
  res.send("code name");
});

app.use((req, res, next) => {
  console.log(req.url, req.method);
  next();
});

app.post("/games/:nickname", (req, res) => {
  const { nickname } = req.params;
  const game = gamesControl.createGame(nickname);
  game.joinGame(nickname);

  res.send(game.gameId);
});

app.post("/games/join/:gameId/:nickname", (req, res) => {
  const { nickname, gameId } = req.params;
  if (nickname !== "undefined") {
    gamesControl.joinGame(gameId, nickname);
    const game = gamesControl.getGame(gameId);
    res.send(game);
    io.to(game.socketId).emit("gameChange", game);
  }
});

app.post("/games/leave/:gameId/:nickname", (req, res) => {
  const { nickname, gameId } = req.params;
  gamesControl.leaveGame(gameId, nickname);
  res.send(gamesControl.getGame(gameId));
});

//app.put("/games/:gameId/:teamColor/:nickname") => {
//const { nickname ,teamColor,gameId} = req.params;
//if (games[gameId][teamColor])

//}

app.get("/games/:gameId", (req, res) => {
  const { gameId } = req.params;
  const game = gamesControl.getGame(gameId);
  console.log(game);
  res.send(game);
});

server.listen(port, () => {
  console.log("Server is listening on " + port);
});
