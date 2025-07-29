---
sidebar_position: 4
---

# Migrating to FHEVM

Now, we will update the contract to take in a single player flag and add encrypted inputs. The encryption of the variables is simple because we have already selected `uint8` as the data type to encrypt. However, for decryption, we must still consider who can decrypt and where. In this tutorial, the administrator of the game, aka. the deployer and owner of the smart contract, has the permission to decrypt and decryption happens onm the frontend.

Since decryption is handled by the frontend, go ahead and remove the `endGame()` function.

In order to add encryption functionality to our contract, we will import the following Zama libraries. The main library is the `FHE.sol` contract as it provides the encrypted types as well as the ability to operate on them. It is the main gateway by which encryption and decryption happens. The `ZamaConfig.sol` provides the addresses to pre-deployed contracts used in onchain operations, for example, the relayer, decryption oracle and main gateway. Lastly, we use OpenZeppelin's `Ownable` library to manage decryption access.

```solidity
import { FHE, euint8, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
```

Corresponding, our contract will inherit these libraries
```solidity
contract Game is SepoliaConfig, Ownable{}
```

Now, we will changes the `moves` variable to `encrypted_moves` and instead of a normal `uint8`, accept `euint8` as the encrypted variant. Additionally, a boolean flag `single_player` is added to offer play against the computer. Finally, remove the `results` variable as this is now handled in the frontend. 
```solidity
address[2] public players;
bool private single_player; //0 - multi-player; 1 - single player
bool public hasPlayed1;
bool public hasPlayed2;
euint8[2] public encrypted_moves; //0 - rock; 1 - paper; 2 - scissors;
```
Next, a constructor is added as the `ownable` library is initialized with the address of the deployer as the owner. The owner has sole jurisdiction over the decryption.
```solidity
constructor() Ownable(msg.sender){}
```

Before the game starts, we will ask the player if they want to play in single player. To this end, we provide a setter function.
```solidity
//////////////////////////////// 
//// Set Single Player Mode ////
////////////////////////////////

/// @notice Allows single player mode
/// @param input Flag for single-player mode 
function selectSinglePlayer(bool input) external {
    single_player = input;
}
```
In case the player selects single player, an if-statement is added which fills both player addresses with the same address and enforces that the `players` variable is empty so that no second player can join.
```solidity
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
```
The `playGame` function now handles single player mode and encrypted inputs. In order to accept encrypted inputs, they are encrypted in the frontend and the smart contract accepts the encrypted data as an `externalEuint8`, along with its proof. The smart contract will then verify the input against the submitted proof and make the encrypted value available onchain. **Note**, in order for the smart contract or users to perform operations on the encrypted variable, for example to decrypt it, permission must be explicitly given by `FHE.allowThis()` and `FHE.allow()` functions, which grants permission to the smart contract and a specific user respectively. In our case, simply call the `owner()` getter function provided by the `Ownable` library to set the owner as the identity with decrypt permissions.

To handle single player mode, we accept the encrypted inputed from player 1 only and then generate a random number with an upper bound using FHEVM random number generation capability. Since we expect inputs from 0 to 2 and there is a limitation on the library to only accept powers of 2 as the upper bound, give the number 4 as the upper bound. Store the computer generate move as "Player 2".

```solidity
////////////////////////////////////////////// 
//// Players submit their encrypted moves ////
////////////////////////////////////////////// 

/// @notice Players submit their encrypted moves asynchronously along with its proof
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
```

Verify that everthing compiles correctly by, once again, running
```bash
npx hardhat compile
```

This will generate new types for our project.
