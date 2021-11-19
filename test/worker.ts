import { createTestKeyring } from '@polkadot/keyring/testing';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { apiTransaction } from './test';
import { workerData, parentPort } from 'worker_threads';
import BN from 'bn.js';

console.log('Beginning');

async function work(): Promise<void> {
    const keyring = createTestKeyring();
    const pair = keyring.getPairs();
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');
    const api: ApiPromise = await ApiPromise.create({ provider: wsProvider });

    const promises = [];
    for (let i = 0; i < 4; i++) {
        let { nonce }: any = await api.query.system.account(pair[i].address);
        nonce = new BN(nonce.toString());
        for (let j = 0; j < workerData.loop; j++) {
            promises.push(apiTransaction(pair, api, i, 4, nonce));
            nonce = nonce.add(new BN(1));
        }
    }
    await Promise.all(promises);
}

console.log('End')
work()