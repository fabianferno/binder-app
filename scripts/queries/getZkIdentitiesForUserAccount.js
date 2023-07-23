const { request, gql } = require("graphql-request");

// Function to query the subgraph and retrieve zkIdentities for the given user
async function getZkIdentitiesForUserAccount(userAccount) {
  const endpoint =
    "https://api.thegraph.com/subgraphs/name/silviamargaritaocegueda/bb-wallets";
  const query = gql`
    query MyQuery($userAccount: Bytes) {
      account(id: $userAccount) {
        zkIdentities
      }
    }
  `;

  try {
    const data = await request(endpoint, query, { userAccount });
    return data.account.zkIdentities;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

// Usage example
const userAccount = "0xb93e20e6d05678e148badcf3de00be641e153bc3"; // Replace this with the user's address you want to query
getZkIdentitiesForUserAccount(userAccount)
  .then((identities) => {
    console.log("zkIdentities:", identities);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
