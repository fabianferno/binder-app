const parent1 = args[0]
const parent2 = args[1]
const negative_prompt = args[2]
const guidance_scale = args[3]
const tokenId = args[4]
const rarity = args[5]

if (secrets.stableCogApiKey == "") {
  throw Error("STABLECOG_API_KEY environment variable not set for Image Generation API.")
}
if (secrets.nftStorageApiKey == "") {
  throw Error("NFT_STORAGE_API_KEY environment variable not set for NFT Storage API.")
}

const prompt =
  rarity > 90
    ? "Lengendary, expensive, golden, glorious"
    : rarity > 70
    ? "Epic, different, purple, mighty"
    : rarity > 60
    ? "Rare, special, blue, unique"
    : rarity > 40
    ? "Uncommon, decent, green, normal"
    : "Common, cheap, grey, poor"

const createSpeciesNFTRequest = Functions.makeHttpRequest({
  url: "https://api.stablecog.com/v1/image/generation/create",
  method: "POST",
  headers: {
    Authorization: `Bearer ${secrets.stableCogApiKey}`,
  },
  data: {
    prompt: "Generate a mix of" + parent1 + " and " + parent2 + " with the following characteristics: " + prompt,
    negative_prompt: negative_prompt,
    guidance_scale: guidance_scale,
    num_outputs: 1,
  },
})

// First, execute all the API requests are executed concurrently, then wait for the responses
const [createSpeciesNFTResponse] = await Promise.all([createSpeciesNFTRequest])

if (!createSpeciesNFTResponse.error) {
  const metadata = {
    name: amimal + " #" + tokenId,
    image: createSpeciesNFTResponse.data.num_outputs[0].url,
    descripton: prompt,
    attributes: [
      {
        trait_type: "Parent 1",
        value: parent1,
      },
      {
        trait_type: "Parent 2",
        value: parent2,
      },
      {
        trait_type: "Rarity",
        value:
          rarity > 90
            ? "Lengendary"
            : rarity > 70
            ? "Epic"
            : rarity > 60
            ? "Rare"
            : rarity > 40
            ? "Uncommon"
            : "Common",
      },
    ],
  }
  const stringifiedMetadata = JSON.stringify(metadata)
  const storeNFTmetadataRequest = Functions.makeHttpRequest({
    url: "https://zixins-be1.adaptable.app/auth/store",
    method: "POST",
    headers: {
      Authorization: `Bearer ${secrets.nftStorageApiKey}`,
    },
    data: {
      metadataString: stringifiedMetadata,
    },
  })

  const [storeNFTmetadataResponse] = await Promise.all([storeNFTmetadataRequest])

  if (!storeNFTmetadataResponse.error) {
    const metadataUri = "https://" + storeNFTmetadataResponse.data.value.cid + ".ipfs.nftstorage.link/"
    return Functions.encodeString(metadataUri)
  } else {
    throw Error("NFT Storage Error")
  }
} else {
  throw Error("StableCog Error")
}
