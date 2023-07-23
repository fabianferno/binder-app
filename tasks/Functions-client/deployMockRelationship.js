task("deploy-mock-relationship", "Deploys Relationship contract implementation").setAction(async (taskArgs, hre) => {
  console.log(`Deploying Relationship contract implementation to ${network.name}`)

  if (network.name === "hardhat") {
    throw Error(
      'This command cannot be used on a local development chain.  Specify a valid network or simulate an Functions request locally with "npx hardhat functions-simulate".'
    )
  }
  const relationship = await ethers.getContractFactory("Relationship")
  const relationshipContract = await relationship.deploy(
    "hello",
    "0xF6BC2c2BD12f3B31B1fE9Cbfc3590cBd4858AC09",
    "0xF6BC2c2BD12f3B31B1fE9Cbfc3590cBd4858AC09",
    "0xF6BC2c2BD12f3B31B1fE9Cbfc3590cBd4858AC09"
  )
  console.log(`\nWaiting ${5} blocks for transaction ${relationshipContract.deployTransaction.hash} to be confirmed...`)

  await relationshipContract.deployTransaction.wait(5)
  console.log("\nVerifying contract...")
  try {
    await run("verify:verify", {
      address: relationshipContract.address,
      constructorArguments: [
        "hello",
        "0xF6BC2c2BD12f3B31B1fE9Cbfc3590cBd4858AC09",
        "0xF6BC2c2BD12f3B31B1fE9Cbfc3590cBd4858AC09",
        "0xF6BC2c2BD12f3B31B1fE9Cbfc3590cBd4858AC09",
      ],
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
  console.log(`Relationship contract deployed to ${relationshipContract.address} on ${network.name}`)
})
