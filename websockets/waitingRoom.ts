import { Server } from "socket.io";
import { updateRoom } from "../libs/roomUpdater";
import {
  getSecondsLeft,
  startCountdown,
  stopCountdown,
} from "../libs/countdown";

// Define constants
const waitingRoom = "waitingRoom";
// const gameRoom = "gameRoom";
let usersInWaitingRoom: any[] = [];
export let usersInGameRoom: any[] = [];

// Define function to handle waiting room logic
export function handleWaitingRoom(socket: any, io: Server) {
  let playerId: any;
  // Join waiting room
  socket.join(waitingRoom);
  console.log("A user connected");

  // Listen for the "dataPlayer" event
  socket.on("dataPlayer", (id: any) => {
    playerId = id;
    // Call function to add user to waiting room
    addUserToWaitingRoom();
  });

  // Function to add user to waiting room
  function addUserToWaitingRoom() {
    // Create player object with playerId and socket id
    const player = {
      playerId: playerId,
      id: socket.id,
    };

    // Add user to waiting room
    usersInWaitingRoom.push(player);
    // Update room
    updateRoom(io, waitingRoom, usersInWaitingRoom);

    // Start countdown if necessary and end it if timeout
    if (usersInWaitingRoom.length === 1) {
      startCountdown(io, waitingRoom);
      console.log("Start counting");
    }

    // Move users to game room when there are five users
    if (usersInWaitingRoom.length === 5) {
      console.log("you can start the game");
      io.to(waitingRoom).emit("moveTogameRoom");

      usersInWaitingRoom.forEach((user) => {
        const socket = io.sockets.sockets.get(user.id);
        if (socket) {
          socket.leave(waitingRoom);
        }
      });
      usersInWaitingRoom = [];
    }
  }

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");

    const indexLeft = usersInWaitingRoom.findIndex(
      (user) => user.id === socket.id
    );

    if (indexLeft !== -1) {
      usersInWaitingRoom.splice(indexLeft, 1);
      updateRoom(io, waitingRoom, usersInWaitingRoom);
    }

    if (usersInWaitingRoom.length === 0) {
      getSecondsLeft(30);
      stopCountdown();
      console.log("Room", waitingRoom, "terminated.");
    }
  });
}

export default handleWaitingRoom;
