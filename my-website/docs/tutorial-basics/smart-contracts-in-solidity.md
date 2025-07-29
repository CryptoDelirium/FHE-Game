---
sidebar_position: 3
---

# Smart Contracts in Solidity

In this section, we will start with a simple, multi-player only, game that is coded in solidity. The contract allows two players to join a game and returns the result of the winner.

For reference, the full project may be cloned at
```bash
git clone https://github.com/CryptoDelirium/FHE-Game
```

To start, initialize a new hardhat project with
```bash
npx hardhat init
```
## Creating Game.sol
In the `contracts` folder, create a new file called `Game.sol`. Specify the license, solidity version and initiate an empty contract.
```javascript
//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Game{

}
```

Inside the Game contract, declare the global variables. In this case, since user moves is identified as data we want to later encrypt, uint8 is used as the smallest type which can be encrypted. This is an example of 'Think Encryption'.
```javascript
    address[2] public players;
    bool private single_player; //0 - multi-player; 1 - single player
    bool public hasPlayed1;
    bool public hasPlayed2;
    uint8[2] public moves; //0 - rock; 1 - paper; 2 - scissors;
    uint8 public result; //0 - draw; 1 - player 1 win, 2 - player 2 wins
```

As a first step, the contract allows players to enter the lobby. In multiplayer mode, two different addresses may join the lobby. Currently, the contract can play one game only - This is highly inefficient! Can you modify the code to allow new games, or even better, allow simultaneous games?

```javascript
//////////////////////////////////// 
//// Allow players to join game ////
//////////////////////////////////// 

/// @notice The game lobby for single or multi-player Rock-Paper-Scissors
function joinGame() public {
    require( players[0]==address(0) || players[1]==address(0), "Lobby Full");
    if (players[0]!= address(0)){
    players[1] = msg.sender;
    }
    else{
        players[0] = msg.sender;
    }
}
```
When the players have entered the lobby, they are able to submit a move. According to the global variable: 0 - Rock, 1 - Paper and 2 - Scissors. Note here that we set the hasPlayed flag to true before executing the action of recording the player move onchain. This is a defensive coding pattern called the [Checks-Effects-Interaction](https://fravoll.github.io/solidity-patterns/checks_effects_interactions.html), originally developed to mitigate Reentrancy attacks.

```javascript
////////////////////////////////////////////// 
//// Players submit their encrypted moves ////
////////////////////////////////////////////// 
function playGame(uint8 input) public {
    require(msg.sender==players[0] || msg.sender==players[1], "Invalid Player");

    if(msg.sender==players[0]){
      // Check-effect-interact defensive coding pattern
      hasPlayed1 = true;
      // There is no checking of player input (0, 1, or 2) on the contract. Must check in the frontend!
      moves[0] = input;
    } else {
        hasPlayed2 = true;
        moves[1] = input;
    }
}
```
Finally, once both players have submitted their moves, the contract checks the winner. Covering the easiest case of a draw first, to equalö nuim bers implies the same move was selected. For the second check, all possible winning combinations are exhaustively checked.
```javascript
/////////////////////////////// 
////   Determine Outcome   ////
///////////////////////////////
function endGame() public returns(uint8){
  require(hasPlayed1 && hasPlayed2, "Waiting on player");

  if (moves[0]==moves[1]){
      result = 0;
  } else{
      if(moves[0]==0 && moves[1]==1){ //player1 rock - player2 paper
          result = 2;
      }
      if(moves[0]==0 && moves[1]==2){ //player1 rock - player2 scissors
          result = 1;
      }
      if(moves[0]==1 && moves[1]==0){ //player1 paper - player2 rock
          result = 1;
      }
      if(moves[0]==1 && moves[1]==2){ //player1 paper - player2 scissors
          result = 2;
      }
      if(moves[0]==2 && moves[1]==0){ //player1 scissors - player2 rock
          result = 1;
      }
      if(moves[0]==0 && moves[1]==1){ //player1 scissors - player2 paper
          result = 2;
      }
  }
  return result;
}
```

After the completion of all the function, compile the contract to verify its correctness
```bash
npx hardhat compile
```

In the next section, the game will be modified to allow single player and mask user input through the use of FHEVM.