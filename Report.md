# Challenge Post Mortem
A short report on the work flow, including the milestones and stumbling blocks of each step, and additionally,possibilities for the future. For clarity, the following emojis are used.
✅ Milestone
❌ A minor inconvenience, quick fix
❌❌❌ A major inconvenience, significant time increase or impact

### Coding
As an experience driven learner, I first looked at the provided Solidity tutorial and followed the example until the end. Then, I briefly went the node package to see, in code, what types are supported and major functionalities. Then, I wrote the code in pure Solidity and wrote test cases. This is followed by converting the code to include FVEvm encryption and finally adding randomness.

##### 1. Walkthrough of tutorial
✅ Installation of environment
    ✅ Install nvm, through that, install npm and LTS version of nodejs.
    ❌ Hardhat functions slowly in WSL. Even after conversion to WSL1. Not code related. Did not spend time debugging.
✅ Check `package.json`for malware  before installation. Good security practice.
✅ Clear tutorial illustrating the most important functionalities.
✅ Decision to use `uint8` to represent inputs as the FHEvm fully supports a range of actions on this type.

##### 2. Code and Testing
✅ Wrote V1 in Solidity and tests in Typescript.

✅ Integrate FHEvm libraries and re-test
    ❌ Dependency hell with scattered documentation.
    ❌ Installing `@fhevm/hardhat-plugin` downloads default version `0.0.1-0`. This caused odd issues until I checked the tutorial and changed to version `0.0.1-6`.
    ❌ Version `0.0.1-6` could not be installed due to chai-matcher version. This limitation is noted in npm but not in the official documentation.
    ❌ Zama oracle is default version `0.0.1` on npm but this conflicts with the @fhevm 0.7.0 library. Had to upgrade to pre-release version `0.1.0`.
    ✅ Finally, I simply copied `hardhat.config.ts` and followed the versions on the tutorial `package.json` file.    

✅ Added in random number generation.
    ❌ Uncertain why there is a limitation in the `FHEVMExecutor.sol` that the number must be a power of 2. Given how inputs are managed, this have to be handled in the frontend.

❌❌❌ Considering the point of decryption!!!
    I had initially decrypted the inputs in the smart contracts. Only close to the deadline did I realise that cleartext can be read even in private variables given the transparent nature of blockchain then I had to debate which of the two routes to take:

    1. Work on the encrypted variables in the smart contract -> the way the smart contract is programmed, this would require many calls to the decryption oracle.
    2. Grab the encrypted variables and decrypt in the frontend and let the frontend handle the winner logic -> nothing on chain, more complex frontend.

    ✅ In the end, I opted for option 2 as there were scalability concerns with frequent oracle calls and had to re-write test logic very close to deadline.

### Documentation
### Future Considerations
I commented out, but did not delete, the original contract logic, because I would like to discuss with future colleagues the consequences of both points of decryption.