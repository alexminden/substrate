import { createTestKeyring } from '@polkadot/keyring/testing';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { apiTransaction, httpTransaction } from './test';

async function main() {
    const keyring = createTestKeyring();
    const pair = keyring.getPairs();
    const wsProvider = new WsProvider('ws://3.113.3.63:9944');
    const api: ApiPromise = await ApiPromise.create({ provider: wsProvider });
    const now = await api.query.timestamp.now();
    for (let i in pair) {
        const balance = await api.query.system.account(pair[i].address);
        console.log(`Account ${pair[i].address} balance is ${balance}`);
    }

    await apiTransaction(pair, api);
    await httpTransaction(pair);
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    }
);