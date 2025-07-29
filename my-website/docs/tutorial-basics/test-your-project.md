---
sidebar_position: 5
---

# Test your project

In this section, we will write two test suites to thoroughly test our contracts to test the multiplayer and single player mode of the game.

## Setup
To begin, import the necessary libraries. `Types` are the variables and functions generated from the contract ABI, along witzh the `ethers` library, allows contract interactions. The hardhat environment is needed to mock a local chain and the FHEVM. `Signers` mock users and their wallet and lastly, `chai` is used for comparison of executed and expected result.
```typescript
import { Game } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { fhevm } from "hardhat";
import { expect } from "chai";
import { ethers} from "hardhat";
import hre from "hardhat";
```

Now that we have the necessary tools to write tests, let's first build a Hardhat `Fixture`. Fixtures allow the environment to be setup once but always reverted to this state before each test. This speeds up testing **a lot**. Since we want to start with a new game each test and the contract itself currently does not support initiating new games, we will create a fixture which returns the state to contract deployed after each test.

```typescript
async function deployGameFixture() {

const [owner, player1, player2] = await hre.ethers.getSigners();

const Game = await hre.ethers.getContractFactory("Game");
const Deployed_Game = await Game.deploy() as Game;
const Game_Address = await Deployed_Game.getAddress();

return {owner, player1, player2, Deployed_Game, Game_Address};
}
```
Hardhat uses specific descriptors to parse their tests. Each test suite is encapsulated in a `describe()` function and each test case is defined by `it()`. In order to use the Fixture we wrote above and not repeated load it into each test, Hardhat provides a built-in `beforeEach()` function which will be executed before each test case. Therefore, we simply load the Fixture in the `beforeEach()` function. Go ahead and create two suites, one called `Multiplayer` and the other `Singleplayer`. 
```typescript
describe("TEST_SUITE_NAME", function () {
    let owner: HardhatEthersSigner;
    let player1: HardhatEthersSigner;
    let player2: HardhatEthersSigner;
    let Deployed_Game: Game;
    let Game_Address: string;

    beforeEach(async () => {
    // Deploy a new instance of the contract before each test
        ({owner, player1, player2, Deployed_Game, Game_Address} = await deployGameFixture());
    });

    it("TEST_NAME", async function () {
        // Write test logic here
    });
}
```

## Use Cases
Each successive test case is built upon the previous ones. Therefore, instead of the full functions, this tutorial will only show the new code at each step and skip previous duplicates.

### Multiplayer
After you have [setup](#setup) the environment. Let's test the Multiplayer use case.

The first test case is a sanity check that the environment was setup correctly and the contract deployed successfully.
```typescript
it("contract deployment", async function () {
    console.log(`Game has been deployed at address ${Game_Address}`);
    // Test the deployed address is valid
    expect(ethers.isAddress(Game_Address)).to.eq(true);
});
```
Once the contract is made available onchain, allows players to join the game asynchronously.
```typescript
it("players join game", async function () {
    const tx = await Deployed_Game.connect(player1).joinGame();
    await tx.wait();
    const player = await Deployed_Game.players(0);

    expect(player).to.eq(player1.address);
});
```
It is a good practice to test `require` statements along with the logic. Here, if a user tries to submit a choice while not being one of the two players admitted in the lobby, the test should fail. The `Chai` library provides the call `to.be.revertedWith()` for such cases.

**Note**, it is a convention on such tests to start the test name with "should...". 
```typescript
it("should revert without first joining", async function () {
    const tx = await Deployed_Game.connect(player1).joinGame();
    await tx.wait();

    //Player 2 attempts to play without joining
    const encryptedInput = await fhevm.createEncryptedInput(Game_Address, player2.address).add8(1).encrypt();
    expect(Deployed_Game.connect(player2).playGame(encryptedInput.handles[0], encryptedInput.inputProof)).to.be.revertedWith("Invalid Player");
});
```
Now that the players have joined game, let's check if the inputs are correctly captured as encrypted values. From the `players join game` tgest case, add in the following logic. This time, a player 2 joins the game and both submit a choice. The frontend then encrypts the input by calling the FHEVM. The encrypted input is then sent onchain.
```typescript
const tx2 = await Deployed_Game.connect(player2).joinGame();
await tx2.wait();

// Generate encrypted inputs
const encryptedInput0 = await fhevm.createEncryptedInput(Game_Address, player1.address).add8(0).encrypt();
const encryptedInput1 = await fhevm.createEncryptedInput(Game_Address, player2.address).add8(1).encrypt();

//Player 1 chooses Rock
const tx3 = await Deployed_Game.connect(player1).playGame(encryptedInput0.handles[0], encryptedInput0.inputProof);
await tx3.wait();
// Player 2 chooses Paper
const tx4 = await Deployed_Game.connect(player2).playGame(encryptedInput1.handles[0], encryptedInput1.inputProof);
await tx4.wait();

expect(Deployed_Game.hasPlayed1);
expect(Deployed_Game.hasPlayed2);
```
After the contract has recorded both inputs, the frontend can get the encrypted input and decrypt it. In order to decrypt the inputs, care must be taken that the expected target data type, in this cae `eunint8`, must match. Then, provide the encrypted bytes, the contract address and the user with permission to decrypt the value. After receiving the cleartext value on the frontend, each case can be checked, similar to the `endGame()` function used in the Soldity version of the game.
```typescript
// Frontend requests the encrypted variables and requests decryption
const player1_einput = await Deployed_Game.connect(owner).encrypted_moves(0);
const player2_einput = await Deployed_Game.connect(owner).encrypted_moves(1);

const player1_cleartext = await fhevm.userDecryptEuint(
    FhevmType.euint8, 
    player1_einput,
    Game_Address,
    owner,
);

const player2_cleartext = await fhevm.userDecryptEuint(
    FhevmType.euint8,
    player2_einput,
    Game_Address,
    owner,
);

// Determine winner
if (player1_cleartext == player2_cleartext){
        console.log("This is a draw");
} else{
    if(player1_cleartext == BigInt(0) && player2_cleartext == BigInt(1)){
        console.log("Player 1 plays Rock, Player 2 plays Paper.\nPlayer 2 wins");
    }
    if(player1_cleartext == BigInt(0) && player2_cleartext == BigInt(2)){
        console.log("Player 1 plays Rock, Player 2 plays Scissors.\nPlayer 1 wins");
    }
    if(player1_cleartext == BigInt(1) && player2_cleartext == BigInt(0)){
        console.log("Player 1 plays Paper, Player 2 plays Rock.\nPlayer 1 wins");
    }
    if(player1_cleartext == BigInt(1) && player2_cleartext == BigInt(2)){ //player1 paper - player2 scissors
        console.log("Player 1 plays Paper, Player 2 plays Scissors.\nPlayer 2 wins");
    }
    if(player1_cleartext == BigInt(2) && player2_cleartext == BigInt(0)){ //player1 scissors - player2 rock
        console.log("Player 1 plays Scissors, Player 2 plays Rock.\nPlayer 2 wins");
    }
    if(player1_cleartext == BigInt(2) && player2_cleartext == BigInt(1)){ //player1 scissors - player2 paper
        console.log("Player 1 plays Scissors, Player 2 plays Paper.\nPlayer 1 wins");
    }
}
```
### Single player

In the single player version, recall that the game slightly alters the way players join and how the inputs are recorded. Therefore, go ahead and copy the sanity check deployment test in once again, and then we will write some tests which checks the single player logic.

When a player joins in single player, both slots of the lobby are filled with the same address. Therefore, we will check this equality.
```typescript
it("player join single game", async function () {
    await Deployed_Game.selectSinglePlayer(true);
    const tx_join = await Deployed_Game.connect(player1).joinGame();
    await tx_join.wait();

    // expect both addresses to be equal for single player
    expect(await Deployed_Game.players(0)).to.eq(await Deployed_Game.players(1));
});
```
Once the player submits a move, the contract automatically generates a random move in response and mark both players has having played. This test checks the `hasPlayed` flags but you can also print out the random generate value for clarity.
```typescript
// Generate encrypted inputs
const encryptedInput0 = await fhevm.createEncryptedInput(Game_Address, player1.address).add8(0).encrypt();

//Player 1 chooses Rock
const tx3 = await Deployed_Game.connect(player1).playGame(encryptedInput0.handles[0], encryptedInput0.inputProof);
await tx3.wait();

expect(Deployed_Game.hasPlayed1);
expect(Deployed_Game.hasPlayed2);
```
Lastly, to identify the winner, the workflow is exactly the same as the multiplayer test. The only caveat here is the aforementioned upper bound - It is possible to generate a 3 occasionally. Therefore, simply add a check before the winning if-block to handle this exception. In this case, the game chooses to display an error.
```typescript
if(computer_cleartext==BigInt(3)){
    console.log("Game unable to complete due to cryptographic constraint on the random number generation. Please play again.");
}
```

Once the test suite is coded, run the tests with
```bash
npx hardhat test
```

:::tip[Hardhat supports many test functions]
It is also possible to run coverage tests and gas test with hardhat, which can help you optimize your contract. Refer to the [test documentation](https://hardhat.org/tutorial/testing-contracts).
:::