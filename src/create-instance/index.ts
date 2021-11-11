import { Context } from 'aws-lambda';
import { ec2, sm } from '../aws';
import { sleep } from '../utils/utils';
import { makeCommand } from './command';

export async function handler(event: any, context: Context): Promise<void> {
    try {
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
        // await ec2.createInstance(nameSecret);
        // await sleep(5000);
        const instance = await ec2.getInstances();
        console.log('instance: ', instance);
        console.log('key: ', key);
        await makeCommand(key, instance[0].PublicDnsName!);
    } catch (err) {
        throw new Error(`Function error: ${err}`);
    }
}