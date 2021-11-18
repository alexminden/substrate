import { createTestKeyring } from '@polkadot/keyring/testing';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { apiTransaction, httpTransaction } from './test';
import BN from 'bn.js';

async function main() {
    const loop = 200;
    const keyring = createTestKeyring();
    const pair = keyring.getPairs();
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');
    const api: ApiPromise = await ApiPromise.create({ provider: wsProvider });
    const now = await api.query.timestamp.now();
    let data = (await api.query.system.account(pair[4].address)).data;
    console.log(`Account ${pair[4].address} balance is ${data.free}`);

    // const time = new Date().getTime();
    // for (let i = 0; i < 4; i++) {
    //     const promises = [];
    //     let { nonce }: any = await api.query.system.account(pair[i].address);
    //     nonce = new BN(nonce.toString());
    //     for (let j = 0; j < loop; j++) {
    //         promises.push(apiTransaction(pair, api, i, 4, nonce));
    //         nonce = nonce.add(new BN(1));
    //     }
    //     await Promise.all(promises);
    // }
    // await calculateTPS(api, time, loop, 1);

    console.log('HTTP');
    const time = new Date().getTime();
    const promises = [];
    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < loop; i++) {
            promises.push(await httpTransaction(pair[j], pair[4]));
        }
    }
    await Promise.all(promises);
    await calculateTPS(api, time, loop, 1);
    data = (await api.query.system.account(pair[4].address)).data
    console.log(`Account ${pair[4].address} balance is ${data.free}`);

}

async function calculateTPS(api: ApiPromise, time: number, loop: number, accounts: number) {
    let extrinsic = await api.rpc.author.pendingExtrinsics();
    while (extrinsic.length > 0) {
        extrinsic = await api.rpc.author.pendingExtrinsics();
    }
    const time2 = (new Date().getTime() - time) / 1000;
    console.log('Transactions: ', loop * accounts * 4, '\nTime: ', time2, '\nTPS: ', loop * accounts * 4 / time2);
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    }
);