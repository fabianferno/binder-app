task("deploy-rel-registry", "Deploys ERC6551 Registry contract")
  .addParam("relationship", "Address of Relationship Implementation contract")
  .setAction(async (taskArgs, hre) => {
    console.log(`Deploying Relationship Registry contract to ${network.name}`)

    if (network.name === "hardhat") {
      throw Error(
        'This command cannot be used on a local development chain.  Specify a valid network or simulate an Functions request locally with "npx hardhat functions-simulate".'
      )
    }
    const relRegistry = await ethers.getContractFactory("RelationshipRegistry")
    const relRegistryContract = await relRegistry.deploy(taskArgs.relationship)
    console.log(`\nWaiting 3 blocks for transaction ${relRegistryContract.deployTransaction.hash} to be confirmed...`)

    await relRegistryContract.deployTransaction.wait(3)
    console.log("\nVerifying contract...")
    try {
      await run("verify:verify", {
        address: relRegistryContract.address,
        constructorArguments: [taskArgs.relationship],
      })
      console.log("Contract verified")
    } catch (error) {
      if (!error.message.includes("Already Verified")) {
        console.log("Error verifying contract.  Delete the build folder and try again.")
        console.log(error)
      } else {
        console.log("Contract already verified")
      }
    }
    console.log(`RelationshipRegistry contract deployed to ${relRegistryContract.address} on ${network.name}`)
  })
