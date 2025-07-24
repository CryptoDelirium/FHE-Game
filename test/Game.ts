import { Game } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";


  async function deployGameFixture() {

    const [owner, player1, player2] = await hre.ethers.getSigners();

    const Game = await hre.ethers.getContractFactory("Game");
    const Deployed_Game = await Game.deploy() as Game;
    const Game_Address = await Deployed_Game.getAddress();

    return {owner, player1, player2, Deployed_Game, Game_Address};
  }

  describe("GameTest", function () {
    let owner: HardhatEthersSigner;
    let player1: HardhatEthersSigner;
    let player2: HardhatEthersSigner;
    let Deployed_Game: Game;
    let Game_Address:String;

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
      await expect(Deployed_Game.connect(player2).playGame(1)).to.be.revertedWith("Invalid Player");
    });

    it("player inputs recorded", async function () {
      // Both players join game
      const tx1 = await Deployed_Game.connect(player1).joinGame();
      await tx1.wait();
      const tx2 = await Deployed_Game.connect(player2).joinGame();
      await tx2.wait();

      //Player 1 chooses Rock
      const tx3 = await Deployed_Game.connect(player1).playGame(0);
      await tx3.wait();
      // Player 2 chooses Paper
      const tx4 = await Deployed_Game.connect(player2).playGame(1);
      await tx4.wait();

      await expect(await Deployed_Game.moves(0)).to.eq(0);
      await expect(await Deployed_Game.moves(1)).to.eq(1);
    });

    it("returns correct winner", async function () {
      // Both players join game
      const tx1 = await Deployed_Game.connect(player1).joinGame();
      await tx1.wait();
      const tx2 = await Deployed_Game.connect(player2).joinGame();
      await tx2.wait();

      //Player 1 chooses Rock
      const tx3 = await Deployed_Game.connect(player1).playGame(0);
      await tx3.wait();
      // Player 2 chooses Paper
      const tx4 = await Deployed_Game.connect(player2).playGame(1);
      await tx4.wait();

      const tx_end = await Deployed_Game.endGame();
    //Player 2 wins!
      await expect(await Deployed_Game.result()).to.eq(2);
    });

  });