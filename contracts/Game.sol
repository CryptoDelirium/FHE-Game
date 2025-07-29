//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { FHE, euint8, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract Game is SepoliaConfig, Ownable{
    address[2] public players;
    bool private single_player; //0 - multi-player; 1 - single player
    bool public hasPlayed1;
    bool public hasPlayed2;
    euint8[2] public encrypted_moves; //0 - rock; 1 - paper; 2 - scissors;

    constructor() Ownable(msg.sender){}

    //////////////////////////////// 
    //// Set Single Player Mode ////
    ////////////////////////////////

    /// @notice Allows single player mode
    /// @param input Flag for single-player mode 
    function selectSinglePlayer(bool input) external {
        single_player = input;
    }

    //////////////////////////////////// 
    //// Allow players to join game ////
    //////////////////////////////////// 

    /// @notice The game lobby for single or multi-player Rock-Paper-Scissors
    function joinGame() public {
        if(single_player){
            require(players[0]==address(0), "Lobby Full");
            players[0] = msg.sender;
            players[1] = msg.sender;
        } else {
            require( players[0]==address(0) || players[1]==address(0), "Lobby Full");
            if (players[0]!= address(0)){
            players[1] = msg.sender;
            }
            else{
                players[0] = msg.sender;
            }
        }
    }

    ////////////////////////////////////////////// 
    //// Players submit their encrypted moves ////
    ////////////////////////////////////////////// 

    /// @notice Players submit their encrypted moves asynchronously along with its proof
    /// @param input An external encrypted input of the player provided by the frontend
    /// @param proof Corresponding proof of encryption
    /// @dev there is no input checking on the smart contract. Must check validity of use input on the frontend!
    /// @dev Only the owner, administrator of the game, may decrypt. Not the players.
    function playGame(externalEuint8 input, bytes calldata proof) public {
        if(single_player){
            require(msg.sender==players[0], "Invalid Player");
            euint8 singleEncryptedInput = FHE.fromExternal(input, proof);
            hasPlayed1 = true;
            hasPlayed2 = true;
            
            encrypted_moves[0] = singleEncryptedInput;
            encrypted_moves[1] = FHE.randEuint8(4);
            FHE.allowThis(encrypted_moves[0]);
            FHE.allow(encrypted_moves[0], owner());
            FHE.allowThis(encrypted_moves[1]);
            FHE.allow(encrypted_moves[1], owner());
        } else {
            require(msg.sender==players[0] || msg.sender==players[1], "Invalid Player");
            euint8 encryptedInput = FHE.fromExternal(input, proof);
            
            if(msg.sender==players[0]){
                hasPlayed1 = true;
                // No checking here;
                encrypted_moves[0] = encryptedInput;
                FHE.allowThis(encrypted_moves[0]);
                FHE.allow(encrypted_moves[0], owner());
            } else {
                hasPlayed2 = true;
                // No checking here;
                encrypted_moves[1] = encryptedInput;
                FHE.allowThis(encrypted_moves[1]);
                FHE.allow(encrypted_moves[1], owner());
            }
        }
    }
    ////////////////////////////////////////////
    //// Do not use!! Cleartext decryption  ////
    //// in contract reveals player moves   ////
    ////////////////////////////////////////////

    /*
    ///@dev Given the limitation that the random number generation requires a power of 2, a generated 3 would result in a draw!!! 
    function endGame() public returns(uint8){
        require(hasPlayed1 && hasPlayed2, "Waiting on player");
        require(decrypted, "Not yet decrypted");
        console.log("The moves are: %i and %i.\n 0 - Rock, 1- Paper, 2 - Scissors", cleartext_moves[0], cleartext_moves[1]);
        if (cleartext_moves[0] == cleartext_moves[1]){
            result = 0;
        } else{
            if(cleartext_moves[0] == 0 && cleartext_moves[1] == 1){ //player1 rock - player2 paper
                result = 2;
            }
            if(cleartext_moves[0] == 0 && cleartext_moves[1]==2){ //player1 rock - player2 scissors
                result = 1;
            }
            if(cleartext_moves[0]==1 && cleartext_moves[1]==0){ //player1 paper - player2 rock
                result = 1;
            }
            if(cleartext_moves[0]==1 && cleartext_moves[1]==2){ //player1 paper - player2 scissors
                result = 2;
            }
            if(cleartext_moves[0]==2 && cleartext_moves[1]==0){ //player1 scissors - player2 rock
                result = 1;
            }
            if(cleartext_moves[0]==0 && cleartext_moves[1]==1){ //player1 scissors - player2 paper
                result = 2;
            }
        }

        return result;
    }

    ///////////////// Helper Functions /////////////////
function requestDecryptPlayerMoves() external {
    bytes32[] memory cypherTexts = new bytes32[](2);
    cypherTexts[0] = FHE.toBytes32(encrypted_moves[0]);
    cypherTexts[1] = FHE.toBytes32(encrypted_moves[1]);

    decrypted = true;

    FHE.requestDecryption(cypherTexts, this.callbackDecryptMultipleValues.selector);
}

function callbackDecryptMultipleValues(uint256 requestID, uint8 decryptPlayer1, uint8 decryptPlayer2, bytes[] memory signatures) external {
    FHE.checkSignatures(requestID, signatures);
    cleartext_moves[0] = decryptPlayer1;
    cleartext_moves[1] = decryptPlayer2;
  } */
}
