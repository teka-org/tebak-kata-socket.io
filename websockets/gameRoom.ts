import Axios from "axios";
import { Server } from "socket.io";
import updateRoom from "../libs/roomUpdater";

const gameRoom = "gameRoom";
let usersInGameRoom: any[] = [];

// Handling game room logic
// export function handleGameRoom(socket: any, io: Server) {
//   let playerId: any;
//   // Join waiting room
//   socket.join(gameRoom);

//   // Listen for the "dataPlayer" event
//   // socket.on("dataPlayer", (id: any) => {
//   //   playerId = id;
//   //   // Call function to add user to waiting room
//   //   addUserToGameRoom();
//   // });

//   // function addUserToGameRoom() {
//   //   const player = {
//   //     playerId: playerId,
//   //     id: socket.id,
//   //   };

//   //   usersInGameRoom.push(player);
//   //   updateRoom(io, gameRoom, usersInGameRoom);
//   // }

//   const player = {
//     // playerId: playerId,
//     id: socket.id,
//   };
//   usersInGameRoom.push(player);
//   updateRoom(io, gameRoom, usersInGameRoom);

//   if (usersInGameRoom.length === 5) {
//     const getQuestionfromAPI = async () => {
//       try {
//         const res = await Axios.get("http://localhost:8080/api/v1/quiz");
//         const quiz = res.data;

//         // Shuffling logic
//         const shuffleQuestion = (quiz: any) => {
//           // to make all the array shuffle
//           for (let i = quiz.length - 1; i > 0; i--) {
//             const j = Math.floor(Math.random() * (i + 1)); // Random index within the unshuffled portion of the array
//             // Swap elements at indices i and j
//             const temp = quiz[i];
//             quiz[i] = quiz[j];
//             quiz[j] = temp;
//           }
//           return quiz;
//         };

//         let shuffledQuestion = shuffleQuestion(quiz);

//         let questionInterval: any;
//         let secondsQuiz = 5;

//         const sendQuestion = () => {
//           const currentQuestion = shuffledQuestion.shift();
//           io.to(gameRoom).emit("totalQuestions", shuffledQuestion.length);

//           function shuffleOptions(array: any) {
//             for (let i = array.length - 1; i > 0; i--) {
//               const j = Math.floor(Math.random() * (i + 1));
//               [array[i], array[j]] = [array[j], array[i]];
//             }
//             return array;
//           }
//           const options = [
//             currentQuestion.answer,
//             currentQuestion.option1,
//             currentQuestion.option2,
//             currentQuestion.option3,
//           ];
//           shuffleOptions(options);
//           const question = currentQuestion.question;

//           io.to(gameRoom).emit("game", { question, options });

//           if (shuffledQuestion.length === 0) {
//             clearInterval(questionInterval);
//             io.to(gameRoom).emit("noMoreQuestions", "Game Over!");
//             console.log("Game Over");
//           }
//         };

//         const countdownQuestion = () => {
//           questionInterval = setInterval(() => {
//             io.to(gameRoom).emit("countdownQuestions", secondsQuiz);
//             secondsQuiz--;

//             if (secondsQuiz === -1) {
//               sendQuestion();
//               secondsQuiz = 15;
//             }
//           }, 1000); // Countdown interval is 1 second
//         };

//         countdownQuestion();
//       } catch (error) {
//         console.log("Error fetching questions:", error);
//       }
//     };

//     getQuestionfromAPI();
//   } else {
//     console.log("Need 5 players to start the game");
//   }

//   // Handle disconnection
//   socket.on("disconnect", () => {
//     console.log("A user disconnected");

//     // Handle disconnection for users in the game room
//     const indexLeftGame = usersInGameRoom.findIndex(
//       (user) => user.id === socket.id
//     );

//     if (indexLeftGame !== -1) {
//       console.log(`${indexLeftGame} left game room`);
//       usersInGameRoom.splice(indexLeftGame, 1);
//       updateRoom(io, gameRoom, usersInGameRoom);
//     }
//   });
// }

// Handling game room logic
export function handleGameRoom(socket: any, io: Server) {
  let playerId: any;
  // Join waiting room
  socket.join(gameRoom);

  // Listen for the "dataPlayer" event
  socket.on("dataPlayers", (id: any) => {
    playerId = id;
    // Call function to add user to game room
    addUserToGameRoom();
  });

  function addUserToGameRoom() {
    const player = {
      playerId: playerId,
      id: socket.id,
    };

    // Check if the user is already in the game room
    const existingPlayerIndex = usersInGameRoom.findIndex(
      (user) => user.id === player.id
    );

    if (existingPlayerIndex === -1) {
      usersInGameRoom.push(player);
      updateRoom(io, gameRoom, usersInGameRoom);

      if (usersInGameRoom.length === 5) {
        startGame(); // Start the game if there are 5 players
      }
    }
  }

  function startGame() {
    const getQuestionfromAPI = async () => {
      try {
        const res = await Axios.get("http://localhost:8080/api/v1/quiz");
        const quiz = res.data;

        // Shuffling logic
        const shuffleQuestion = (quiz: any) => {
          // to make all the array shuffle
          for (let i = quiz.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // Random index within the unshuffled portion of the array
            // Swap elements at indices i and j
            const temp = quiz[i];
            quiz[i] = quiz[j];
            quiz[j] = temp;
          }
          return quiz;
        };

        let shuffledQuestion = shuffleQuestion(quiz);

        let questionInterval: any;
        let secondsQuiz = 5;

        const sendQuestion = () => {
          const currentQuestion = shuffledQuestion.shift();
          io.to(gameRoom).emit("totalQuestions", shuffledQuestion.length);

          function shuffleOptions(array: any) {
            for (let i = array.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
          }
          const options = [
            currentQuestion.answer,
            currentQuestion.option1,
            currentQuestion.option2,
            currentQuestion.option3,
          ];
          shuffleOptions(options);
          const question = currentQuestion.question;

          io.to(gameRoom).emit("game", { question, options });

          if (shuffledQuestion.length === 0) {
            clearInterval(questionInterval);
            io.to(gameRoom).emit("noMoreQuestions", "Game Over!");
            console.log("Game Over");
          }
        };

        const countdownQuestion = () => {
          questionInterval = setInterval(() => {
            io.to(gameRoom).emit("countdownQuestions", secondsQuiz);
            secondsQuiz--;

            if (secondsQuiz === -1) {
              sendQuestion();
              secondsQuiz = 15;
            }
          }, 1000); // Countdown interval is 1 second
        };

        countdownQuestion();
      } catch (error) {
        console.log("Error fetching questions:", error);
      }
    };

    getQuestionfromAPI();
  }

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");

    // Handle disconnection for users in the game room
    const indexLeftGame = usersInGameRoom.findIndex(
      (user) => user.id === socket.id
    );

    if (indexLeftGame !== -1) {
      console.log(`${indexLeftGame} left game room`);
      usersInGameRoom.splice(indexLeftGame, 1);
      updateRoom(io, gameRoom, usersInGameRoom);
    }
  });
}

export default handleGameRoom;
