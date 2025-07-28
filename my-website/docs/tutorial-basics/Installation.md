---
sidebar_position: 1
---

# Installation
In order to run the tutorial, the following softwares are required:
- [Nodejs](#nodejs) to compile and execute the project
- [Hardhat](#hardhat) as the toolchain to compile and test the code
- [Xcode](#xcode) as the IDE in which we write the code

## Nodejs

>You must use an even numbered version of Nodejs

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
Windows users are encouraged to install [Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/install) and then following the instructions in the [Mac and Linux](#mac-and-linux) section to complete the installation.

## Hardhat
## Xcode

Add **Markdown or React** files to `src/pages` to create a **standalone page**:

- `src/pages/index.js` → `localhost:3000/`
- `src/pages/foo.md` → `localhost:3000/foo`
- `src/pages/foo/bar.js` → `localhost:3000/foo/bar`

## Create your first React Page

Create a file at `src/pages/my-react-page.js`:

```jsx title="src/pages/my-react-page.js"
import React from 'react';
import Layout from '@theme/Layout';

export default function MyReactPage() {
  return (
    <Layout>
      <h1>My React page</h1>
      <p>This is a React page</p>
    </Layout>
  );
}
```

A new page is now available at [http://localhost:3000/my-react-page](http://localhost:3000/my-react-page).

## Create your first Markdown Page

Create a file at `src/pages/my-markdown-page.md`:

```mdx title="src/pages/my-markdown-page.md"
# My Markdown page

This is a Markdown page
```

A new page is now available at [http://localhost:3000/my-markdown-page](http://localhost:3000/my-markdown-page).

Get started by **creating a new site**.

Or **try Docusaurus immediately** with **[docusaurus.new](https://docusaurus.new)**.

### What you'll need

- [Node.js](https://nodejs.org/en/download/) version 18.0 or above:
  - It is recommended to 

## Generate a new site

Generate a new Docusaurus site using the **classic template**.

The classic template will automatically be added to your project after you run the command:

```bash
npm init docusaurus@latest my-website classic
```

You can type this command into Command Prompt, Powershell, Terminal, or any other integrated terminal of your code editor.

The command also installs all necessary dependencies you need to run Docusaurus.
