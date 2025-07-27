import { Game } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { HardhatFhevmRuntimeEnvironment } from "@fhevm/hardhat-plugin";
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

    // We use the FHEVM Hardhat plugin to simulate the asynchronous on-chain
    // decryption
    const fhevm: HardhatFhevmRuntimeEnvironment = hre.fhevm;

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

    it("should fail without calling decryption", async function () {
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

      expect(Deployed_Game.endGame()).to.be.revertedWith("Not yet decrypted");
    });

    it("identify winner", async function () {
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

    // Use the built-in `awaitDecryptionOracle` helper to wait for the FHEVM decryption oracle
    // to complete all pending Solidity decryption requests.
    const tx_decrypt = await Deployed_Game.connect(owner).requestDecryptPlayerMoves();
    await tx_decrypt.wait();
    await fhevm.awaitDecryptionOracle();

    // Determine winner
    const tx_end = await Deployed_Game.endGame();

    console.log(tx_end.from);
    await tx_end.wait();

    expect(await Deployed_Game.result()).to.eq(2);
  });

  describe("Single-player", function () {
    let owner: HardhatEthersSigner;
    let player1: HardhatEthersSigner;
    let player2: HardhatEthersSigner;
    let Deployed_Game: Game;
    let Game_Address: string;

    // We use the FHEVM Hardhat plugin to simulate the asynchronous on-chain
    // decryption
    const fhevm: HardhatFhevmRuntimeEnvironment = hre.fhevm;

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
      const tx_single = await Deployed_Game.selectMode(true);
      await tx_single.wait();
      const tx_join = await Deployed_Game.connect(player1).joinGame();
      await tx_join.wait();

      // expect both addresses to be equal for single player
      expect(await Deployed_Game.players(0)).to.eq(await Deployed_Game.players(1));
    });

    it("player inputs recorded", async function () {
      // Select single player
      const tx_single = await Deployed_Game.selectMode(true);
      await tx_single.wait();
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
      const tx_single = await Deployed_Game.selectMode(true);
      await tx_single.wait();
      const tx1 = await Deployed_Game.connect(player1).joinGame();
      await tx1.wait();

      // Generate encrypted inputs
      const clear_zero = 0;
      const encryptedInput0 = await fhevm.createEncryptedInput(Game_Address, player1.address).add8(clear_zero).encrypt();

      //Player 1 chooses Rock
      const tx3 = await Deployed_Game.connect(player1).playGame(encryptedInput0.handles[0], encryptedInput0.inputProof);
      await tx3.wait();

      // Use the built-in `awaitDecryptionOracle` helper to wait for the FHEVM decryption oracle
      // to complete all pending Solidity decryption requests.
      const tx_decrypt = await Deployed_Game.connect(owner).requestDecryptPlayerMoves();
      await tx_decrypt.wait();
      await fhevm.awaitDecryptionOracle();

      // Determine winner
      const tx_end = await Deployed_Game.endGame();
      await tx_end.wait();

      const result = await Deployed_Game.result();

      console.log("Expected winner is player %i. Player 0 is draw", Number(result));
      //expect(await Deployed_Game.result()).to.eq(2);
    });
  });
});