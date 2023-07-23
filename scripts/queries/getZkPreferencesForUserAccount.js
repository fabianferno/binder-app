const { request, gql } = require("graphql-request");

// Function to query the subgraph and retrieve zkPrefrences for the given user
async function getZkPreferencesForUserAccount(userAccount) {
  const endpoint =
    "https://api.thegraph.com/subgraphs/name/silviamargaritaocegueda/bb-wallets";
  const query = gql`
    query MyQuery($userAccount: Bytes) {
      account(id: $userAccount) {
        preferences
      }
    }
  `;

  try {
    const data = await request(endpoint, query, { userAccount });
    return data.account.preferences;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

// Usage example
// const userAccount = "0xb93e20e6d05678e148badcf3de00be641e153bc3"; // Replace this with the user's address you want to query
// getZkPreferencesForUserAccount(userAccount)
//   .then((preferences) => {
//     console.log("Preferences:", preferences);
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });
