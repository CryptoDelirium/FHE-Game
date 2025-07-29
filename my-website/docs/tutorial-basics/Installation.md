---
sidebar_position: 1
---

# Installation
In order to run the tutorial, the following softwares are required:
- [Nodejs](#nodejs) to compile and execute the project
- [Hardhat](#hardhat) as the toolchain to compile and test the code
- [[Optional] VSCode](#optional-vscode) as the IDE in which we write the code

## Nodejs

:::danger[Nodejs version warning] 
You must use an even numbered version of Nodejs
:::


### Mac and Linux
#### Installation via UI
The easiest way to install [nodejs](https://nodejs.org/en/download) and npm is through nvm (node version manager).
- Go to the [nodejs](https://nodejs.org/en/download) website.
- Select the LTS version of Nodejs
- Select your operating system
- Select "nvm" in the `using` field
- Open your Terminal and paste the commands displayed below.

#### Installation via CLI
Open the Terminal and type in the following commands
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
### Windows
:::tip[Using WSL]

Hardhat may run slowly on WSL2. WSL1 is recommended for this project.

:::

Windows users are encouraged to install [Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/install) and then following the instructions in the [Mac and Linux](#mac-and-linux) section to complete the installation.

## Hardhat
Hardhat is provided directly through npm
- Open the terminal.
  - Windows users: Open powershell and start WSL.
- Install hardhat through npm
```bash
# Hardhat requires a minimum Node version of >=12.x and npm
node -v
npm -v

# Install Hardhat
npm i hardhat
```
## [Optional] VSCode
:::tip[Any text editor works!]

This step may be skipped if you have an IDE of choice but VSCode supports a number of useful Solidity plugins.

:::

Download VSCode from its [official website](https://code.visualstudio.com/download).

 # :rocket: You are all setup!