task("deploy-breed-babies", "Deploys Burner Babies NFT contract").setAction(async (taskArgs, hre) => {
  console.log(`Deploying Burner Babies NFT contract to ${network.name}`)

  if (network.name === "hardhat") {
    throw Error(
      'This command cannot be used on a local development chain.  Specify a valid network or simulate an Functions request locally with "npx hardhat functions-simulate".'
    )
  }
  const breedBabies = await ethers.getContractFactory("BreedBabies")
  const breedBabiesContract = await breedBabies.deploy("0xF6BC2c2BD12f3B31B1fE9Cbfc3590cBd4858AC09")
  console.log(`\nWaiting ${5} blocks for transaction ${breedBabiesContract.deployTransaction.hash} to be confirmed...`)

  await breedBabiesContract.deployTransaction.wait(5)
  console.log("\nVerifying contract...")
  try {
    await run("verify:verify", {
      address: breedBabiesContract.address,
      constructorArguments: ["0xF6BC2c2BD12f3B31B1fE9Cbfc3590cBd4858AC09"],
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
  console.log(`Burner Babies contract deployed to ${breedBabiesContract.address} on ${network.name}`)
})
