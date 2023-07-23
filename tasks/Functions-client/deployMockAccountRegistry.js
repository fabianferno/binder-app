task("deploy-account-registry", "Deploys ERC6551 Registry contract")
  .addParam("implementation", "ERC6551 implementation contract")
  .setAction(async (taskArgs, hre) => {
    console.log(`Deploying BinderERC6551Registry contract to ${network.name}`)

    if (network.name === "hardhat") {
      throw Error(
        'This command cannot be used on a local development chain.  Specify a valid network or simulate an Functions request locally with "npx hardhat functions-simulate".'
      )
    }
    const relRegistry = await ethers.getContractFactory("BinderERC6551Registry")
    const relRegistryContract = await relRegistry.deploy(taskArgs.implementation)
    console.log(
      `\nWaiting ${5} blocks for transaction ${relRegistryContract.deployTransaction.hash} to be confirmed...`
    )

    await relRegistryContract.deployTransaction.wait(5)
    console.log("\nVerifying contract...")
    try {
      await run("verify:verify", {
        address: relRegistryContract.address,
        constructorArguments: [taskArgs.implementation],
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
    console.log(`BinderERC6551Registry contract deployed to ${relRegistryContract.address} on ${network.name}`)
  })
