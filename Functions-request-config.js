const fs = require("fs")

// Loads environment variables from .env.enc file (if it exists)
require("@chainlink/env-enc").config()

const Location = {
  Inline: 0,
  Remote: 1,
}

const CodeLanguage = {
  JavaScript: 0,
}

const ReturnType = {
  uint: "uint256",
  uint256: "uint256",
  int: "int256",
  int256: "int256",
  string: "string",
  bytes: "Buffer",
  Buffer: "Buffer",
}

// Configure the request by setting the fields below
const requestConfig = {
  codeLocation: Location.Inline,
  codeLanguage: CodeLanguage.JavaScript,
  source: fs.readFileSync("./Functions-request-create-species-source.js").toString(),
  secrets: {
    nftStorageApiKey: process.env.NFT_STORAGE_API_KEY ?? "",
    imageApiKey: process.env.IMAGE_API_KEY ?? "",
  },
  perNodeSecrets: [],
  walletPrivateKey: process.env["PRIVATE_KEY"],
  args: [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBdsVryD5aOp_SRERVlVk51jz0gFlRcPZRzusR4EreRQ&s",
    "83759283759483257",
  ],
  expectedReturnType: ReturnType.string,
  secretsURLs: [],
}

module.exports = requestConfig
