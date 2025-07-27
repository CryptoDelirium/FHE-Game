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

### selectMode

```solidity
function selectMode(bool input) external
```

### joinGame

```solidity
function joinGame() public
```

A game lobby allowing 2 players to join for a game of Rock-Paper-Scissors

### playGame

```solidity
function playGame(externalEuint8 input, bytes proof) public
```

Players submit their encrypted moves asynchronously along with its proof

### endGame

```solidity
function endGame() public returns (uint8)
```

### requestDecryptPlayerMoves

```solidity
function requestDecryptPlayerMoves() external
```

### callbackDecryptMultipleValues

```solidity
function callbackDecryptMultipleValues(uint256 requestID, uint8 decryptPlayer1, uint8 decryptPlayer2, bytes[] signatures) external
```

