import React from 'react';
import {Text, View, FlatList} from 'react-native';
import {init, useQuery} from '@airstack/airstack-react';
import tw from 'twrnc';
init('5ae0d900a013478eadb6edf53e579715');

const TokenBalanceList = (tokenNfts: any) => {
  let data: any = tokenNfts.tokenNfts
    .filter((item: any) => item.tokenNfts != null)
    .map((item: any) => ({
      address: item.tokenNfts.erc6551Accounts[0].address.addresses[0],
    }));
  console.log(JSON.stringify(data));
  const renderAccountItem = (item: any) => {
    return (
      <View
        style={{marginVertical: 10, padding: 10, backgroundColor: '#f0f0f0'}}>
        <Text style={tw`font-bold text-indigo-600`}>
          Address: {JSON.stringify(item)}
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={item => item.address}
      renderItem={renderAccountItem}
    />
  );
};

export default function TBAsOfAddress(props: any) {
  const query = `query MyQuery($owner: [Identity!]) {
    TokenBalances(
      input: {filter: {owner: {_in: $owner}}, blockchain: ethereum, limit: 200}
    ) {
      TokenBalance {
        tokenNfts {
          erc6551Accounts {
            address {
              addresses
              blockchain
              identity
              domains {
                createdAtBlockNumber
                createdAtBlockTimestamp
                dappName
                dappSlug
                name
                owner
                parent
              }
            }
          }
        }
      }
    }
  }`;

  const {data, loading, error} = useQuery(
    query,
    {
      owner: props?.address || '0xcf94ba8779848141d685d44452c975c2ddc04945', // '0xcf94ba8779848141d685d44452c975c2ddc04945'
    },
    {cache: false},
  );

  if (loading) {
    return <Text>Loading...</Text>;
  } else if (error) {
    return <Text>Error: {JSON.stringify(error)}</Text>;
  } else {
    return (
      <View>
        {data ? (
          // data.TokenBalances.TokenBalance.tokenNfts
          <TokenBalanceList tokenNfts={data.TokenBalances.TokenBalance} />
        ) : (
          <Text>No data available.</Text>
        )}
      </View>
    );
  }
}
