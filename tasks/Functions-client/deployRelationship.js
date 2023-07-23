const fs = require("fs")
task("deploy-relationship", "Deploys Relationship contract implementation").setAction(async (taskArgs, hre) => {
  console.log(`Deploying Relationship contract implementation to ${network.name}`)

  if (network.name === "hardhat") {
    throw Error(
      'This command cannot be used on a local development chain.  Specify a valid network or simulate an Functions request locally with "npx hardhat functions-simulate".'
    )
  }
  const sourceCode = fs.readFileSync("./Functions-request-create-species-source.js").toString()
  const relationship = await ethers.getContractFactory("Relationship")
  const relicsContractAddress = "0x8C66aaCb86Ae66B3f9F4D17894505B8bB6A09c48"
  const relationshipContract = await relationship.deploy(sourceCode, relicsContractAddress)
  console.log(`\nWaiting 3 blocks for transaction ${relationshipContract.deployTransaction.hash} to be confirmed...`)

  await relationshipContract.deployTransaction.wait(3)
  console.log("\nVerifying contract...")
  try {
    await run("verify:verify", {
      address: relationshipContract.address,
      constructorArguments: [sourceCode, relicsContractAddress],
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
  console.log(`Burner Babies contract deployed to ${relationshipContract.address} on ${network.name}`)
})
