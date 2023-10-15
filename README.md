![image](https://github.com/fabianferno/binder-app/assets/57835412/7608fe48-f6a4-42e1-b79f-0a7110ab2c64)

## Project Description
Hey there! Welcome to Binder, the NFT platform that's all about building meaningful relationships. Our aim is to help you meet new NFTs and forge deep connections using preferences and identity characteristics. The best part? You get to make priceless memories with these awesome NFTs and capture those moments as special relics that you'll cherish forever. So why wait? Join us, make some new friends, and let's create something truly beautiful together!

## How it's Made
Upon a user's entrance into Binder via Walletconnect, they gain new usage options for their NFT. Subsequently, we initiate the process of binding a soul-bound account to this NFT if such an account does not already exist. This soul-bound account plays a pivotal role, enabling the secure storage of user preferences essential for effective matching with other NFTs. Additionally, it serves as the repository for the user's identity, safeguarded through zkProofs facilitated by Sismo, thereby facilitating the matching process.

Information, including user preferences, identity, and matching data, is meticulously stored within a TheGraph.

Once a successful match is identified, both NFTs involved in the match receive a notification. The NFT holder is then prompted to confirm the match, paving the way for further interaction. By utilizing push protocol, matched individuals gain the ability to engage in real-time chats based on their NFTs. In addition, a Gnosis safe is created which can be used to perform transactions. These transactions have to be signed by the token-bound account of the NFTs.

Moreover, as a testament to the transformative power of these newfound connections, users are empowered to create an NFT for their connections. Here we have worked with Chainlink to add some rarity when generating these NFTs based on the specifics of the parents. Naturally, these freshly minted NFTs can be subsequently added to our platform, perpetuating the cycle of discovery and relationships.
