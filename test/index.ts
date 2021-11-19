import { createTestKeyring } from '@polkadot/keyring/testing';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { apiTransaction, httpTransaction } from './test';
import { Worker } from 'worker_threads';
import BN from 'bn.js';

async function main() {
    // Loop番号を変更することで、各アカウントの取引数を増減させることができます。
    const loop = 1000;

    const keyring = createTestKeyring();
    const pair = keyring.getPairs();
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');

    const api: ApiPromise = await ApiPromise.create({ provider: wsProvider });

    let data = (await api.query.system.account(pair[4].address)).data;
    console.log(`Account ${pair[4].address} balance is ${data.free}`);
    const time = new Date().getTime();
    const promises = [];
    const worker = new Worker(`
            require('tsconfig-paths/register');
            require('ts-node/register');
            require(require('worker_threads').workerData.runThisFileInTheWorker);`,
    {
        eval: true,
        workerData: {
            loop: loop,
            runThisFileInTheWorker: './test/worker.ts'
        }
    });
    promises.push(new Promise(r => worker.on('exit', r)));
    await Promise.all(promises).then(() => console.log('Finished1'));
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