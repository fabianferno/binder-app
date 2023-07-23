const { request, gql } = require("graphql-request");

// Function to query the subgraph and retrieve relationships for the given user
async function getRelationshipsForUser(user) {
  const endpoint =
    "https://api.thegraph.com/subgraphs/name/silviamargaritaocegueda/bb-relationships";
  const query = gql`
    query MyQuery($user: Bytes) {
      relationships(where: { or: [{ parent1: $user }, { parent2: $user }] }) {
        id
        parent1
        parent2
      }
    }
  `;

  try {
    const data = await request(endpoint, query, { user });
    return data.relationships;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

// Usage example
const userAddress = "0xbe188d6641e8b680743a4815dfa0f6208038960f"; // Replace this with the user's address you want to query
getRelationshipsForUser(userAddress)
  .then((relationships) => {
    console.log("Relationships:", relationships);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
