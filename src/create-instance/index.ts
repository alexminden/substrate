import { Context } from 'aws-lambda';
import { ec2, sm } from '../aws';
import { sleep } from '../utils/utils';
import { makeCommand } from './command';

export async function handler(event: any, context: Context): Promise<void> {
    try {
        const commandRust = [
            'sudo apt-get update',
            "curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y",
            'source $HOME/.cargo/env',
            'rustup default stable && rustup update && rustup update nightly && rustup target add wasm32-unknown-unknown --toolchain nightly',
            'sudo apt update && sudo apt install -y git clang curl libssl-dev llvm libudev-dev',
        ];
        const commandSubstrate = [
            'git clone -b latest --depth 1 https://github.com/substrate-developer-hub/substrate-node-template',
            'cd substrate-node-template && cargo build --release'
        ];
        const nameSecret = 'Lambda-Test';
        const test = await sm.listKey();
        let key: string = '';
        if (!test.includes(nameSecret)) {
            console.log('Handler KeyPair');
            key = await ec2.createKeyPair(nameSecret);
            await sm.createSecret(nameSecret, key);
        } else {
            key = await sm.getParameter(nameSecret);
        }

        console.log('Handler Instance');
        await ec2.createInstance(nameSecret);
        await sleep(10000);
        const instance = await ec2.getInstances();

        console.log('Download Rust');
        await makeCommand(key, instance[0].PublicDnsName!, commandRust);

        console.log('Download Substrate')
        await makeCommand(key, instance[0].PublicDnsName!, commandSubstrate);
    } catch (err) {
        throw new Error(`Function error: ${err}`);
    }
}