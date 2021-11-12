import { createTestKeyring } from '@polkadot/keyring/testing';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { apiTransaction, httpTransaction } from './test';

async function main() {
    const loop = 100;
    const keyring = createTestKeyring();
    const pair = keyring.getPairs();
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');
    const api: ApiPromise = await ApiPromise.create({ provider: wsProvider });
    const now = await api.query.timestamp.now();
    for (let i in pair) {
        const balance = await api.query.system.account(pair[i].address);
        console.log(`Account ${pair[i].address} balance is ${balance}`);
    }

    const time = new Date().getTime();
    for (let i = 0; i < loop; i++) {
        const promises = [];
        for (let j = 0; j < 4; j++) {
            promises.push(apiTransaction(pair, api, j, 4));
        }
        const res = await Promise.all(promises);
        console.log(res);
    }
    const time2 = (new Date().getTime() - time) / 1000;
    console.log('Transactions: ', loop*4,'\nTime: ', time2,'\nTPS: ', loop*4/time2);
    // await httpTransaction(pair);
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    }
);