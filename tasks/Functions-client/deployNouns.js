task("deploy-ape", "Deploys CeloNFT contract").setAction(async (taskArgs, hre) => {
  console.log(`Deploying BoredApeYachtClub contract to ${network.name}`)

  if (network.name === "hardhat") {
    throw Error(
      'This command cannot be used on a local development chain.  Specify a valid network or simulate an Functions request locally with "npx hardhat functions-simulate".'
    )
  }
  const relationship = await ethers.getContractFactory("BoredApeYachtClub")
  const relationshipContract = await relationship.deploy()
  console.log(`\nWaiting 3 blocks for transaction ${relationshipContract.deployTransaction.hash} to be confirmed...`)

  await relationshipContract.deployTransaction.wait(3)
  console.log("\nVerifying contract...")
  try {
    await run("verify:verify", {
      address: relationshipContract.address,
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
  console.log(`BoredApeYachtClub contract deployed to ${relationshipContract.address} on ${network.name}`)
})
