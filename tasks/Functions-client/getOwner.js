const { task } = require("hardhat/config")

task("get-owner", "Gets the owner for a function").setAction(async (taskArgs, hre) => {
  const { ethers } = hre

  const storeFunctionSelector = ethers.utils.id("owner(address)").slice(0, 10)
  // console.log(storeFunctionSelector.slice(0, 10));
  const storeValueParam = "0x9Ea602eA9c0E402C6251F5A2A0e94E0Ac703fD1F"

  const addressParam = "0xd422A3f234e66C43ba5C131ce09eFFDF5a54FE80"
  const valueParam = 0
  const dataParam = storeFunctionSelector + ethers.utils.defaultAbiCoder.encode(["uint256"], [storeValueParam]).slice(2)

  const executeFunctionSelector = ethers.utils.id("executeCall(address,uint256,bytes)").slice(0, 10)

  // Encode the parameters
  const encodedParams = ethers.utils.defaultAbiCoder.encode(
    ["address", "uint256", "bytes"],
    [addressParam, valueParam, dataParam]
  )
  // console.log(dataParam);
  console.log(executeFunctionSelector + encodedParams.slice(2))
})
