import { Game } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { fhevm } from "hardhat";
import { expect } from "chai";
import { ethers} from "hardhat";
import hre from "hardhat";


  async function deployGameFixture() {

    const [owner, player1, player2] = await hre.ethers.getSigners();

    const Game = await hre.ethers.getContractFactory("Game");
    const Deployed_Game = await Game.deploy() as Game;
    const Game_Address = await Deployed_Game.getAddress();

    return {owner, player1, player2, Deployed_Game, Game_Address};
  }

  describe("Multi-player", function () {
    let owner: HardhatEthersSigner;
    let player1: HardhatEthersSigner;
    let player2: HardhatEthersSigner;
    let Deployed_Game: Game;
    let Game_Address: string;

    beforeEach(async () => {
    // Deploy a new instance of the contract before each test
      ({owner, player1, player2, Deployed_Game, Game_Address} = await deployGameFixture());
    });

    it("contract deployment", async function () {
      console.log(`Game has been deployed at address ${Game_Address}`);
        // Test the deployed address is valid
        expect(ethers.isAddress(Game_Address)).to.eq(true);
    });

    it("players join game", async function () {
      const tx = await Deployed_Game.connect(player1).joinGame();
      await tx.wait();
      const player = await Deployed_Game.players(0);

      expect(player).to.eq(player1.address);
    });

    it("should revert without first joining", async function () {
      const tx = await Deployed_Game.connect(player1).joinGame();
      await tx.wait();

      //Player 2 attempts to play without joining
      const encryptedInput = await fhevm.createEncryptedInput(Game_Address, player2.address).add8(1).encrypt();
      expect(Deployed_Game.connect(player2).playGame(encryptedInput.handles[0], encryptedInput.inputProof)).to.be.revertedWith("Invalid Player");
    });

    it("player inputs recorded", async function () {
      // Both players join game
      const tx1 = await Deployed_Game.connect(player1).joinGame();
      await tx1.wait();
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
    });

    it("frontend decryption and winner logic", async function () {
    // Both players join game
    const tx1 = await Deployed_Game.connect(player1).joinGame();
    await tx1.wait();
    const tx2 = await Deployed_Game.connect(player2).joinGame();
    await tx2.wait();

    // Generate encrypted inputs
    const clear_zero = 0;
    const clear_one = 1;
    const encryptedInput0 = await fhevm.createEncryptedInput(Game_Address, player1.address).add8(clear_zero).encrypt();
    const encryptedInput1 = await fhevm.createEncryptedInput(Game_Address, player2.address).add8(clear_one).encrypt();

    //Player 1 chooses Rock
    const tx3 = await Deployed_Game.connect(player1).playGame(encryptedInput0.handles[0], encryptedInput0.inputProof);
    await tx3.wait();
    // Player 2 chooses Paper
    const tx4 = await Deployed_Game.connect(player2).playGame(encryptedInput1.handles[0], encryptedInput1.inputProof);
    await tx4.wait();

    // Frontend requests the encrypted variables and requests decryption
    const player1_einput = await Deployed_Game.connect(player1).encrypted_moves(0);
    const player2_einput = await Deployed_Game.connect(player2).encrypted_moves(1);

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
  });

  describe("Single-player", function () {
    let owner: HardhatEthersSigner;
    let player1: HardhatEthersSigner;
    let player2: HardhatEthersSigner;
    let Deployed_Game: Game;
    let Game_Address: string;

    beforeEach(async () => {
    // Deploy a new instance of the contract before each test
      ({owner, player1, player2, Deployed_Game, Game_Address} = await deployGameFixture());
    });

    it("contract deployment", async function () {
      console.log(`Game has been deployed at address ${Game_Address}`);
        // Test the deployed address is valid
        expect(ethers.isAddress(Game_Address)).to.eq(true);
    });

    it("player join single game", async function () {
      await Deployed_Game.selectSinglePlayer(true);
      const tx_join = await Deployed_Game.connect(player1).joinGame();
      await tx_join.wait();

      // expect both addresses to be equal for single player
      expect(await Deployed_Game.players(0)).to.eq(await Deployed_Game.players(1));
    });

    it("player inputs recorded", async function () {
      // Select single player
      await Deployed_Game.selectSinglePlayer(true);
      const tx1 = await Deployed_Game.connect(player1).joinGame();
      await tx1.wait();

      // Generate encrypted inputs
      const encryptedInput0 = await fhevm.createEncryptedInput(Game_Address, player1.address).add8(0).encrypt();
      
      //Player 1 chooses Rock
      const tx3 = await Deployed_Game.connect(player1).playGame(encryptedInput0.handles[0], encryptedInput0.inputProof);
      await tx3.wait();

      expect(Deployed_Game.hasPlayed1);
      expect(Deployed_Game.hasPlayed2);
    });

    it("identify winner", async function () {
      // Select single player
      await Deployed_Game.selectSinglePlayer(true);

      const tx1 = await Deployed_Game.connect(player1).joinGame();
      await tx1.wait();

      // Generate encrypted inputs
      const clear_zero = 0;
      const encryptedInput0 = await fhevm.createEncryptedInput(Game_Address, player1.address).add8(clear_zero).encrypt();

      //Player 1 chooses Rock
      const tx3 = await Deployed_Game.connect(player1).playGame(encryptedInput0.handles[0], encryptedInput0.inputProof);
      await tx3.wait();
// Frontend requests the encrypted variables and requests decryption
    const player1_einput = await Deployed_Game.connect(player1).encrypted_moves(0);
    const player2_einput = await Deployed_Game.connect(player2).encrypted_moves(1);

    const player1_cleartext = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      player1_einput,
      Game_Address,
      owner,
    );

    const computer_cleartext = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      player2_einput,
      Game_Address,
      owner,
    );

    // Determine winner
    // Handle the case of 3 due to the power-of-two constraint
    if(computer_cleartext==BigInt(3)){
      console.log("Game unable to complete due to cryptographic constraint on the random number generation. Please play again.");
    }
    if (player1_cleartext == computer_cleartext){
            console.log("This is a draw");
    } else{
        if(player1_cleartext == BigInt(0) && computer_cleartext == BigInt(1)){
            console.log("Player 1 plays Rock, Player 2 plays Paper.\nPlayer 2 wins");
        }
        if(player1_cleartext == BigInt(0) && computer_cleartext == BigInt(2)){
            console.log("Player 1 plays Rock, Player 2 plays Scissors.\nPlayer 1 wins");
        }
        if(player1_cleartext == BigInt(1) && computer_cleartext == BigInt(0)){
            console.log("Player 1 plays Paper, Player 2 plays Rock.\nPlayer 1 wins");
        }
        if(player1_cleartext == BigInt(1) && computer_cleartext == BigInt(2)){ //player1 paper - player2 scissors
            console.log("Player 1 plays Paper, Player 2 plays Scissors.\nPlayer 2 wins");
        }
        if(player1_cleartext == BigInt(2) && computer_cleartext == BigInt(0)){ //player1 scissors - player2 rock
            console.log("Player 1 plays Scissors, Player 2 plays Rock.\nPlayer 2 wins");
        }
        if(player1_cleartext == BigInt(2) && computer_cleartext == BigInt(1)){ //player1 scissors - player2 paper
            console.log("Player 1 plays Scissors, Player 2 plays Paper.\nPlayer 1 wins");
        }
    }
    });
  });
});