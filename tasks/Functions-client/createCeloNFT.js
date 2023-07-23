task("create-celo-nft", "Deploys Relationship contract implementation")
  .addParam("contract", "The address of the CeloNFT contract")
  .addParam("to", "The address of the recipient")
  .addParam("uri", "The URI of the NFT")
  .setAction(async (taskArgs, hre) => {
    console.log(`Deploying BinderERC6551Account contract implementation to ${network.name}`)

    if (network.name === "hardhat") {
      throw Error(
        'This command cannot be used on a local development chain.  Specify a valid network or simulate an Functions request locally with "npx hardhat functions-simulate".'
      )
    }

    const clientContractFactory = await ethers.getContractFactory("CeloNFT")
    const clientContract = await clientContractFactory.attach(taskArgs.contract)
    const createNFTtx = await clientContract.safeMint(taskArgs.to, taskArgs.uri)
    // console.log(`\nWaiting 3 blocks for transaction ${binderContract.deployTransaction.hash} to be confirmed...`)
    const createNFTtxHash = await createNFTtx.wait(3)
    console.log(createNFTtxHash)
    console.log("NFT created!")
  })
