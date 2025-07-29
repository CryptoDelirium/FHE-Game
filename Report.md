# Challenge Post Mortem
A short report on the work flow, including the milestones and stumbling blocks of each step, and additionally,possibilities for the future. For clarity, the following emojis are used.
- ✅ Milestone
- ❌ A minor inconvenience, quick fix
- ❌❌❌ A major inconvenience, significant time increase or impact

### Coding
As an experience driven learner, I first looked at the provided Solidity tutorial and followed the example until the end. Then, I briefly went the node package to see, in code, what types are supported and major functionalities. Then, I wrote the code in pure Solidity and wrote test cases. This is followed by converting the code to include FVEvm encryption and finally adding randomness.

##### 1. Walkthrough of tutorial
- ✅ Installation of environment
    - ✅ Install nvm, through that, install npm and LTS version of nodejs.
    - ❌ Hardhat functions slowly in WSL. Even after conversion to WSL1. Not code related. Did not spend time debugging.
- ✅ Check `package.json`for malware  before installation. Good security practice.
- ✅ Clear tutorial illustrating the most important functionalities.
- ✅ Decision to use `uint8` to represent inputs as the FHEvm fully supports a range of actions on this type.

##### 2. Code and Testing
- ✅ Wrote V1 in Solidity and tests in Typescript.

- ✅ Integrate FHEvm libraries and re-test
    - ❌ Dependency hell with scattered documentation.
    - ❌ Installing `@fhevm/hardhat-plugin` downloads default version `0.0.1-0`. This caused odd issues until I checked the tutorial and changed to version `0.0.1-6`.
    - ❌ Version `0.0.1-6` could not be installed due to chai-matcher version. This limitation is noted in npm but not in the official documentation.
    - ❌ Zama oracle is default version `0.0.1` on npm but this conflicts with the @fhevm 0.7.0 library. Had to upgrade to pre-release version `0.1.0`.
    - ✅ Finally, I simply copied `hardhat.config.ts` and followed the versions on the tutorial `package.json` file.    

- ✅ Added in random number generation.
    - ❌ Uncertain why there is a limitation in the `FHEVMExecutor.sol` that the number must be a power of 2. Given how inputs are managed, this have to be handled in the frontend. Some incoherence in the documentation regarding the upper bound - version 0.7 does not have a page for the random number generation and version 0.6 seems to suggest any value is acceptable. 

- ❌❌❌ Consider the point of decryption!!!
    I had initially decrypted the inputs in the smart contracts. Only close to the deadline did I realise that cleartext can be read even in private variables given the transparent nature of blockchain then I had to debate which of the two routes to take:

    1. Work on the encrypted variables in the smart contract -> the way the smart contract is programmed, this would require many calls to the decryption oracle.
    2. Grab the encrypted variables and decrypt in the frontend and let the frontend handle the winner logic -> nothing on chain, more complex frontend.

    - ✅ In the end, I opted for option 2 as there were scalability concerns with frequent oracle calls and had to re-write test logic very close to deadline.

### Documentation
- ✅ Reflect on the target audience and what kind of content and experience they would like to have
    - New developers need a detailed guide. It is also important to develop a feel for how to add encryption.
    - Frontend only or experienced developers only require an API.
        - ❌ There are very few Solidity documentation generators. Spent some hours evaluating different options but only the OpenZeppelin `solidity-docgen` able to generate a md file which works with Docusaurus.
    - Researchers would like blog articles and scientific content which goes deep into the subject
- ✅ Consider different learning styles
    - Video content or visual learners
    - Sandbox for experience learners
- ❌❌❌ Chose the documentation software platform
    First started with Gitbook as the standard. Easy to use with UI editor. However, Gitbook crashed and the platform did not allow editing close to the submission deadline so changed to Docusaurus for its local deployment and md style editing.

### Future Considerations
There is always room for improvement in the code and documentation. Some possible TODOs:

- It is possible to compare the encrypted value on the smart contract and return an ebool which can be decrypted onchain without revealing the player choice. However, this would require a lot of calls to the decryption oracle given the established workflow of comparing the player input to a 0,1,2, or 3. I left an incorrect attempt in the code as I would like to discuss with colleagues the merits of both onchain and frontend decryption.

- Develop an additional Sepolia test suite for onchain simulation instead of only local hardhat testing.

- Would have loved to implement a playground so new developers can directly interact with the smart contract and see the outputs without needing to install or run code.

- Docusaurus has poor syntax highlighting for solidity. Contribute to the prismjs library for more robust highlighting.

- Setup some developer tags in the github repo to entice open source contributions. For example, `Good-first-issue` for new entrants or a bounty program.

For my own knowledge and interest:

- Dig deeper into the KMS and ACL libraries.
- Make available the foundry and remix version of the Counter tutorial.