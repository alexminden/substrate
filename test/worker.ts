import { createTestKeyring } from '@polkadot/keyring/testing';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { apiTransaction } from './test';
import { workerData, parentPort } from 'worker_threads';
import BN from 'bn.js';

console.log('Beginning: ', workerData.index, workerData.loop);

async function work(): Promise<void> {
    const keyring = createTestKeyring();
    const pair = keyring.getPairs();
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');
    const api: ApiPromise = await ApiPromise.create({ provider: wsProvider });

    // const promises = [];
    let { nonce }: any = await api.query.system.account(pair[workerData.index].address);
    nonce = new BN(nonce.toString());
    for (let j = 0; j < workerData.loop; j++) {
        await api.tx.balances.transfer(pair[4].address, 1000).signAndSend(pair[workerData.index], { nonce });
        // promises.push(apiTransaction(pair, api, workerData.index, 4, nonce));
        nonce = nonce.add(new BN(1));
    }
    // await Promise.all(promises);
}

console.log('End')
work()