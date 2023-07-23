const imageURI = args[0]
const randomness = args[1]

if (!secrets.imageApiKey) {
  throw Error("Image API Key unavailable.")
}

if (!secrets.nftStorageApiKey) {
  throw Error("NFT Storage API Key unavailable.")
}
const colors = [
  "rgba(240,128,128,0.85)",
  "rgba(255,0,255,0.22)",
  "rgba(34,139,34,0.77)",
  "rgba(0,0,205,0.31)",
  "rgba(70,130,180,0.48)",
  "rgba(218,112,214,0.96)",
  "rgba(0,128,0,0.64)",
  "rgba(138,43,226,0.56)",
  "rgba(255,165,0,0.93)",
  "rgba(128,0,0,0.41)",
  "rgba(0,255,0,0.8)",
  "rgba(123,104,238,0.15)",
  "rgba(70,130,180,0.29)",
  "rgba(173,216,230,0.72)",
  "rgba(154,205,50,0.6)",
  "rgba(250,128,114,0.27)",
  "rgba(0,255,127,0.33)",
  "rgba(240,230,140,0.87)",
  "rgba(139,69,19,0.52)",
  "rgba(0,191,255,0.43)",
]
const color = colors[randomness % 20]
const editImageRequest = Functions.makeHttpRequest({
  url: `https://rest.apitemplate.io/v2/create-image`,
  method: "POST",
  headers: { Authorization: `Token ${secrets.imageApiKey}`, "Content-Type": "application/json" },
  params: {
    template_id: "06a77b23a4c61dae",
    expiration: "0",
  },

  data: JSON.stringify({
    overrides: [
      {
        name: "rect_1",
        stroke: "grey",
        backgroundColor: color,
      },
      {
        name: "img_1",
        stroke: "grey",
        src: imageURI,
      },
    ],
  }),
})

const [editImageResponse] = await Promise.all([editImageRequest])

if (editImageResponse.error) {
  throw Error("Edit Image errored")
}
const metadata = {
  name: "Relic",
  description: "Relics created for a NFT relationship",
  image: editImageResponse.data.download_url_png,
  attributes: [
    {
      trait_type: "Rarity",
      value: randomness % 20,
    },
  ],
}

new File()

const metadataString = JSON.stringify(metadata)

const storeNFTmetadataRequest = Functions.makeHttpRequest({
  url: "https://zixins-be1.adaptable.app/auth/store",
  method: "POST",
  headers: {
    Authorization: `Bearer ${secrets.nftStorageApiKey}`,
  },
  data: {
    metadataString: metadataString,
  },
})

const [storeNFTmetadataResponse] = await Promise.all([storeNFTmetadataRequest])

if (!storeNFTmetadataResponse.error) {
  const metadataUri = "https://" + storeNFTmetadataResponse.data.value.cid + ".ipfs.nftstorage.link/metadata.json"
  return Functions.encodeString(metadataUri)
} else {
  throw Error("NFT Storage Error")
}
