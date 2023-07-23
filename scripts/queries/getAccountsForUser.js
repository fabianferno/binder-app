const { request, gql } = require("graphql-request");
// Function to query the subgraph and retrieve 6551-accounts for the given user
async function checkAccountForUser(contract, id, chainId) {
  const endpoint =
    "https://api.thegraph.com/subgraphs/name/silviamargaritaocegueda/mock-wallets";
  const query = gql`
    query MyQuery($contract: Bytes, $id: BigInt, $chainId: BigInt) {
      accounts(
        where: {
          and: [
            { tokenContract: $contract }
            { tokenID: $id }
            { chainID: $chainId }
          ]
        }
      ) {
        id
      }
    }
  `;

  try {
    const data = await request(endpoint, query, { contract, id, chainId });
    console.log("Data:", data);
    return data.accounts;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

async function getAccountsForUser(contracts, ids, chainId) {
  const result = contracts
    .slice(0, ids.length)
    .map((contract, index) => [contract, ids[index]]);
  const accounts = [];

  await Promise.all(
    result.map(([contract, id]) => checkAccountForUser(contract, id, chainId))
  )
    .then((accountResults) => {
      for (const account of accountResults) {
        accounts.push(account[0]);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  return accounts;
}
