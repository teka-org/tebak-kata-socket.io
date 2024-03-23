// countdown.ts

import { Server } from "socket.io";

let seconds: number = 15;
let countdownInterval: NodeJS.Timeout;

export function countdownQuestions(io: Server, gameRoom: string) {
  countdownInterval = setInterval(() => {
    io.to(gameRoom).emit("countdownQuestions", seconds);
    seconds--;
    if (seconds === -1) {
      clearInterval(countdownInterval);
      console.log("Time Out.");
      // io.to(waitingRoom).emit("timeout", "Time Out");
      // Handle countdown finished event
    }
  }, 1000);
}

// Exporting default to satisfy TypeScript's module system
export default countdownQuestions;

export function stopCountdown() {
  clearInterval(countdownInterval);
}

export function getSecondsLeft(no: number): void {
  seconds = no;
}
