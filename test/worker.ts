import { createTestKeyring } from '@polkadot/keyring/testing';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { apiTransaction } from './test';
import { workerData, parentPort } from 'worker_threads';
import BN from 'bn.js';

console.log('Beginning: ', workerData.index, workerData.loop, workerData.memo);

async function work(): Promise<void> {
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');
    const api: ApiPromise = await ApiPromise.create({ provider: wsProvider });
    const keyring = createTestKeyring();
    let index = workerData.index;
    let receiver = 7;
    if (workerData.receiver !== '') {
        keyring.addFromUri(workerData.receiver);
        receiver = 8;
        if (workerData.index > 7) {
            keyring.addFromUri(workerData.memo);
            index = 9;
        }
    }
    const pair = keyring.getPairs();
    let { nonce }: any = await api.query.system.account(pair[index].address);
    nonce = new BN(nonce.toString());
    // let data: any = (await api.query.system.account(pair[index].address)).data;
    for (let j = 0; j < workerData.loop; j++) {
        // await api.tx.tpsModule.transferFrom(pair[index].address, pair[8].address, 1).signAndSend(pair[index], { nonce });
        await api.tx.balances.transfer(pair[receiver].address, 1000).signAndSend(pair[index], { nonce });
        nonce = nonce.add(new BN(1));
    }
}

console.log('End')
work()