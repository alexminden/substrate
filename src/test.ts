import { createTestKeyring } from '@polkadot/keyring/testing';
import { ApiPromise, WsProvider } from '@polkadot/api';
import axios from 'axios';

async function main() {
    const keyring = createTestKeyring();
    const pair = keyring.getPairs();
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create({ provider: wsProvider });
    const now = await api.query.timestamp.now();
    for(let i in pair) {
        const balance = await api.query.system.account(pair[i].address);
        console.log(`Account ${pair[i].address} balance is ${balance}`);
    }

    const txHash = await api.tx.balances.transfer(pair[5].address, 1000).signAndSend(pair[0]);
    console.log(txHash);
    
    // const metadata = await api.rpc.state.getMetadata();
    const test = await axios.post(
        "http://127.0.0.1:9933",
        {
            "jsonrpc": "2.0",
            "method": "runtime_createExtrinsic",
            "params": [
                pair[0].address,
                "Balances",
                "transfer",
                {
                    "dest": pair[5].address,
                    "value": 50
                }
            ],
            "id": 1
        },
        {
            headers: {
                'Content-Type': 'application/json'
            },
        }
    );
    console.log('HTTP: ', test);
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    }
);