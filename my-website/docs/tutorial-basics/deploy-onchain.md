---
sidebar_position: 6
---

# Deploy onchain

To deploy the contract onchain and test it with real encryption, we need to provide the project with an API key of a node which handles interaction with the Sepolia testnet.

The general process for deployment is compile the project for Sepolia, configure the API key and deploy.
```bash
npx hardhat clean
npx hardhat compile --network sepolia
# Set API configuration here
npx hardhat deploy --network sepolia 
```
Now set your Mnemonic and API key with the following
```bash
npx hardhat set vars MNEMONIC
npx hardhat set vars INFURA_API_KEY
```

Finally, deploy your contract with
```bash
npx hardhat deploy --network sepolia 
```

# That's it! For further support please visit our Forum or Discord. 
