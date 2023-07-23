import {Core} from '@quicknode/sdk';

export async function getNFTsOwnedByWallet(
  address = '0xD10E24685c7CDD3cd3BaAA86b09C92Be28c834B6',
) {
  const core = new Core({
    endpointUrl:
      'https://boldest-rough-aura.matic-testnet.discover.quiknode.pro/b7b5fcd3b1450bdb03bc054c77be9b9b5911f7b1',
  });
  core.client
    .qn_fetchNFTs({
      wallet: 'address',
      perPage: 2,
    })
    .then(res => {
      console.log('Data', res);
    });
}
