# Rock-Paper-Scissors with Fully Homomorphic Encryption 

## Table of Contents
- [Background](#background)
- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [Testing and Deployment](#testing-and-deployment)
- [Maintenance and Contribution](#maintenance-and-contribution)
- [License](#license)

## Background
Fully Homomorphic Encryption (FHE) is a cryptographic technique that allows computation on encrypted data (ciphertext) without needing to decrypting it first. This means you can process sensitive data while it stays encrypted, and only the owner of the secret key can decrypt the result. In this project, we demonstrate a use case of FHE by playing a game of Rock-Paper-Scissors and returning the result without needing to store the clear text of the player choices on chain.

## Environment Setup
This project requires:
1. nodejs (>= 16.0.0)- May be installed via [GUI](https://nodejs.org/en/download) or command line
```bash
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js:
nvm install 22

# Verify the Node.js version:
node -v # Should print "v22.17.1".
nvm current # Should print "v22.17.1".

# Verify npm version:
npm -v # Should print "10.9.2".
```

2. Hardhat (Version 3 is a major overhaul from previous versions and is in alpha)
```bash
npm install --save-dev hardhat
```

3. Text Editor of choice. [VSCode](https://code.visualstudio.com/download) recommended.

**For Windows Users:**

Download WSL1 for faster execution on hardhat

## Project Quickstart

Clone this repository
```bash
git clone https://github.com/CryptoDelirium/FHE-Game.git
```

Compile and run the test cases in Hardhat
```bash
npx hardhat compile
npx hardhat test
```

Consult the documentation on the local Docusaurus. Most of the content is found under the documentation tab.
```bash
# From the root of the repository
cd my-website
npm start
# In your browser, go to localhost:3000
```

## Maintenance and Contribution
Contribute to this repository by opening a [pull request]() or [issue]().

## License
This project is made available under the [MIT](https://github.com/CryptoDelirium/FHE-Game/blob/main/LICENSE) license.