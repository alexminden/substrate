import { createTestKeyring } from '@polkadot/keyring/testing';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { Worker } from 'worker_threads';
import { getTxNumber, sleep } from './utils';
import BN from 'bn.js';
import b from 'bignumber.js';

async function main() {
    // Loop番号を変更することで、各アカウントの取引数を増減させることができます。
    const loop = 10000;
    let time = 0;
    const workerNumber: number = 50;

    const wsProvider = new WsProvider('ws://127.0.0.1:9944');

    const api: ApiPromise = await ApiPromise.create({ provider: wsProvider });

    let keyring = createTestKeyring();
    let tab = [];

    for (let numAccount = 0; numAccount < (workerNumber - 7); numAccount++) {
        const newMemo = mnemonicGenerate();
        keyring.addFromUri(newMemo);
        tab.push(newMemo);
    }
    const pair = keyring.getPairs();

    let { nonce }: any = await api.query.system.account(pair[0].address);
    nonce = new BN(nonce.toString());
    for (let add = 1; add < workerNumber; add++) {
        console.log(pair[add].address);
        await api.tx.balances.transfer(pair[add].address, 1000000000000000).signAndSend(pair[0], { nonce });
        nonce = nonce.add(new BN(1));
    }
    await sleep(7000);
    console.log('Check!');

    for (let i in pair) {
        const balance = await api.query.system.account(pair[i].address);
        console.log(`Account ${pair[i].address} balance is ${balance}`);
    }
    // let data = (await api.query.system.account(pair[4].address)).data;
    // let data: any = await api.query.tpsModule.balances(pair[4].address);
    // console.log(data);
    // console.log(`Account ${pair[4].address} balance is ${data.free}`);

    for (let account = 0; account < workerNumber; account++) {
        await api.tx.tpsModule.mint(pair[account].address, 1000000000).signAndSend(pair[account]);
    }

    await sleep(7000);
    // for (let acc = 0; acc < 4; acc++) {
    //     console.log('api: ', await api.query.tpsModule.balances(pair[acc].address));
    // }
    const promises = [];
    for (let index = 0; index < workerNumber; index++) {
        const memo = index > 7 ? tab[index - 8] : '';
        const worker = new Worker(`
            require('tsconfig-paths/register');
            require('ts-node/register');
            require(require('worker_threads').workerData.runThisFileInTheWorker);`,
            {
                eval: true,
                workerData: {
                    loop: loop,
                    index,
                    receiver: tab[tab.length-1],
                    memo: memo,
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
            time += term;
            console.log(`[${afterTime - beforeTime} msec] Block ${index + 1} Mined. txNum = ${txNum}. TPS:`, txNum / term);
            // data = (await api.query.system.account(pair[4].address)).data;
            let data: any = await api.query.tpsModule.balances(pair[workerNumber].address);
            console.log(`Account ${pair[workerNumber].address} balance is ${data['words']} in ${time} seconds`);
            currentIndex = index + 1;
        }
    }, 5000);
}


main().catch(console.error);

// main().then(
//     () => process.exit(),
//     err => {
//         console.error(err);
//         process.exit(-1);
//     }
// );