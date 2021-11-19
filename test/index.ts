import { createTestKeyring } from '@polkadot/keyring/testing';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Worker } from 'worker_threads';
import { getTxNumber } from './utils';

async function main() {
    // Loop番号を変更することで、各アカウントの取引数を増減させることができます。
    const loop = 10000;
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');

    const api: ApiPromise = await ApiPromise.create({ provider: wsProvider });

    const pair = createTestKeyring().getPairs();
    let data = (await api.query.system.account(pair[4].address)).data;
    console.log(`Account ${pair[4].address} balance is ${data.free}`);

    const promises = [];
    for (let index = 0; index < 4; index++) {
        const worker = new Worker(`
            require('tsconfig-paths/register');
            require('ts-node/register');
            require(require('worker_threads').workerData.runThisFileInTheWorker);`,
            {
                eval: true,
                workerData: {
                    loop: loop,
                    index,
                    runThisFileInTheWorker: './test/worker.ts'
                }
            });
        promises.push(new Promise(r => worker.on('exit', r)));
    }

    Promise.all(promises);

    let blockTimes: number[] = [];
    let currentIndex = 0;
    await api.rpc.chain.subscribeNewHeads((header) => {
        let time = (new Date()).getTime();
        console.log(`Block ${header.number} Mined. time = ${time}`);
        blockTimes.push(time);
        console.log(blockTimes.length)
    });
    setInterval(async () => {
        for (let index = currentIndex; index < blockTimes.length - 1; index++) {
            const beforeTime = blockTimes[index];
            const afterTime = blockTimes[index + 1];
            const term = (afterTime - beforeTime) / 1000;
            const txNum = await getTxNumber(api, index + 1);
            console.log(`[${afterTime - beforeTime} msec] Block ${index + 1} Mined. txNum = ${txNum}. TPS:`, txNum / term);
            data = (await api.query.system.account(pair[4].address)).data;
            console.log(`Account ${pair[4].address} balance is ${data.free}`);
            currentIndex = index + 1;
        }
    }, 5000);
}


main().catch(console.error);

// .then(
//     () => process.exit(),
//     err => {
//         console.error(err);
//         process.exit(-1);
//     }
// );