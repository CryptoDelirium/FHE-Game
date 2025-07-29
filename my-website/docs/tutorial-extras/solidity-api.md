---
sidebar_position: 1
---

# Solidity API

## Game

### players

```solidity
address[2] players
```

### hasPlayed1

```solidity
bool hasPlayed1
```

### hasPlayed2

```solidity
bool hasPlayed2
```

### encrypted_moves

```solidity
euint8[2] encrypted_moves
```

### result

```solidity
uint8 result
```

### constructor

```solidity
constructor() public
```

### selectSinglePlayer

```solidity
function selectSinglePlayer(bool input) public
```

Allows single player mode

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| input | bool | Flag for single-player mode |

### joinGame

```solidity
function joinGame() public
```

The game lobby for single or multi-player Rock-Paper-Scissors

### playGame

```solidity
function playGame(externalEuint8 input, bytes proof) public
```

Players submit their encrypted moves asynchronously along with its proof

_there is no input checking on the smart contract. Must check validity of use input on the frontend!
Only the owner, administrator of the game, may decrypt. Not the players._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| input | externalEuint8 | An external encrypted input of the player provided by the frontend |
| proof | bytes | Corresponding proof of encryption |