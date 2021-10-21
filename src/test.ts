import { createTestKeyring } from '@polkadot/keyring/testing';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { methods } from "@substrate/txwrapper-polkadot";
import axios from 'axios';

async function main() {
    const keyring = createTestKeyring();
    const pair = keyring.getPairs();
    // const pair2 = keyring.getPairs()[4];
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create({ provider: wsProvider });
    const now = await api.query.timestamp.now();
    for(let i in pair) {
        const balance = await api.query.system.account(pair[i].address);
        console.log(`Account ${pair[i].address} balance is ${balance}`);
    }

    const txHash = await api.tx.balances.transfer(pair[5].address, 1000).signAndSend(pair[0]);
    console.log(txHash);
    
    const metadata = await api.rpc.state.getMetadata()
    // const tx = await api.tx.balances.transfer(pair[5].address, 1000);
    console.log('Metadata: ' + JSON.stringify(metadata, null, 2));
    // const unsigned = methods.balances.transferKeepAlive(
    //     {
    //         dest: pair2.address,
    //         value: 5000000000,
    //     },
    //     {
    //         address: pair.address,
    //         blockHash:
    //             api.genesisHash,
    //         blockNumber: 4302222,
    //         genesisHash:
    //             api.genesisHash,
    //         metadataRpc: metadata, // must import from client RPC call state_getMetadata
    //         nonce: 2,
    //         specVersion: 1019,
    //         tip: 0,
    //         eraPeriod: 64, // number of blocks from checkpoint that transaction is valid
    //         transactionVersion: 1,
    //     },
    //     {
    //         metadataRpc: metadata,
    //         registry, // Type registry
    //     }
    // );

    // const test = await axios.post(
    //     "http://127.0.0.1:9944/transaction/",
    //     `{ "tx": ${}}`,
    //     {
    //         headers: {
    //             'Accept': "text/plain",
    //             'Content-Type': 'application/json'
    //         },
    //     }
    // );
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    }
);