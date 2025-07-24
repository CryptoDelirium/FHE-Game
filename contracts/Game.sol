//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// import "hardhat/console.sol";

contract Game {
    address[2] public players;
    // bool private single-player;
    bool public hasPlayed1;
    bool public hasPlayed2;
    uint8[8] public moves; //0 - rock; 1 - paper; 2 - scissors;
    uint8 public result; //0 - draw; 1 - player 1 win, 2 - player 2 wins

    //////////////////////////////////// 
    //// Allow players to join game ////
    //////////////////////////////////// 
    function joinGame() public {
        require(players[0]==address(0) || players[1]==address(0), "Lobby Full");
        if (players[0]!= address(0)){
            players[1] = msg.sender;
        }
        else{
            players[0] = msg.sender;
        }
        // future, if two addresses are equal then against computer
    }

    function playGame(uint8 input) public {
        require(msg.sender==players[0] || msg.sender==players[1], "Invalid Player");
        if(msg.sender==players[0]){
            hasPlayed1 = true;
            // No checking here;
            moves[0] = input;
        } else {
            hasPlayed2 = true;
            // No checking here;
            moves[1] = input;
        }
    }

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

}
