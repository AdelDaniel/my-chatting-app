const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const { SocketAddress } = require("net");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");
const {
  generateJoinLeftMessage,
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

// server (emit)  -> client (receive)  - "emittedsuccessfuly"
// client (emit)  -> server (receive)  - "incrementByOne"

const app = express();
const server = http.createServer(app);
const io = socketio(server); // the Server side of socket.io version
const publicDirectoryPath = path.join(__dirname, "../public"); // to work with front end files
const portNumber = process.env.PORT || 3000;

app.use(express.static(publicDirectoryPath));

//socket is an object and each device connected to the server send it's own soket object
// socket.emit              is send Data to one specfic user only so we used io.emit
// io.emit                  is send Data to all immediatly
// socket.broadcast.emit    is send Data to all except the sokect of the user message come from
// io.on('connection')      1- make the server is ready to recive data form the client. 2- runs when a new user open the site
// io.to.emit               emits an event to every body in specific room
// socket.broadcast.to.emit is send Data to all (In specific room) except the sokect of the user message come from
io.on("connection", (socket) => {
  console.log("new web socket");

  socket.on("join", ({ userName, room }, callback) => {
    console.log(`${userName} -------------------- ${room}`);
    const { error, user } = addUser({ id: socket.id, userName, room });
    if (error) {
      return callback({ error });
    }
    socket.join(user.room); // allow us to join a chat room
    // emit >> this send an event from server to clients and recive it in the client js file
    socket.emit(
      "newUserEntered",
      generateJoinLeftMessage(`Welcome ${user.userName}! You Joinded At: `)
    ); // send directly to the new client when open the site
    socket.broadcast
      .to(user.room)
      .emit(
        "newUserEntered",
        generateJoinLeftMessage(`${user.userName} has joined`)
      ); // send directly to the other client when new client open the site
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback({ ack: "Joined" });
  });

  socket.on("sendMessageFromClient", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "sendMessageFromServer",
      generateMessage({ text: message, userName: user.userName })
    );
    callback("ok"); // to send ack to the client
  });

  socket.on("sendLocationFromClient", (locationData, callback) => {
    const user = getUser(socket.id);
    socket.broadcast
      .to(user.room)
      .emit(
        "sendUserlocationToAllFromServer",
        generateLocationMessage({ userName: user.userName, ...locationData })
      );
    callback({ msg: "Location recived by server" });
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "userLeft",
        generateJoinLeftMessage(`${user.userName} left room`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(portNumber, () => console.log(`Server on port: ${portNumber}`));
