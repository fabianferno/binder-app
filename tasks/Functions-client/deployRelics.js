task("deploy-relics", "Deploys Relics contract").setAction(async (taskArgs, hre) => {
  console.log(`Deploying Relcis contract to ${network.name}`)

  if (network.name === "hardhat") {
    throw Error(
      'This command cannot be used on a local development chain.  Specify a valid network or simulate an Functions request locally with "npx hardhat functions-simulate".'
    )
  }

  const binder = await ethers.getContractFactory("Relics")
  const binderContract = await binder.deploy()
  console.log(`\nWaiting ${5} blocks for transaction ${binderContract.deployTransaction.hash} to be confirmed...`)

  await binderContract.deployTransaction.wait(5)
  console.log("\nVerifying contract...")
  try {
    await run("verify:verify", {
      address: binderContract.address,
      constructorArguments: [],
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
  console.log(`Relics contract deployed to ${binderContract.address} on ${network.name}`)
})
