import {EAS, SchemaEncoder} from '@ethereum-attestation-service/eas-sdk';
export const EASContractAddress = '0xC2679fBD37d54388Ce493F1DB75320D236e1815e'; // Sepolia v0.26
// // Initialize the sdk with the address of the EAS Schema contract address
const eas = new EAS(EASContractAddress);

export async function giveMeetingAttestation(
  provider: any,
  value: any,
  signer: any,
  recipient: any,
) {
  eas.connect(provider);

  const offchain = await eas.getOffchain();
  // Initialize SchemaEncoder with the schema string
  const schemaEncoder = new SchemaEncoder('bool isTrue');
  const encodedData = schemaEncoder.encodeData([
    {name: 'isTrue', value: value, type: 'bool'},
  ]);

  const timestamp = Date.now();

  const offchainAttestation = await offchain.signOffchainAttestation(
    {
      recipient: recipient,
      // Unix timestamp of when attestation expires. (0 for no expiration)
      expirationTime: 0,
      // Unix timestamp of current time
      time: timestamp,
      revocable: true,
      version: 1,
      nonce: 0,
      schema:
        '0x4eb603f49d68888d7f8b1fadd351b35a252f287ba465408ceb2b1e1e1efd90d5',
      refUID:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      data: encodedData,
    },
    signer,
  );

  return offchainAttestation;
}
