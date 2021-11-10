import { Context } from 'aws-lambda';
import { ec2, sm } from '../aws';

export async function handler(event: any, context: Context): Promise<void> {
    try {
        const nameSecret = 'Lambda-Test';
        const test = await sm.listKey();
        let key: string = '';
        if (!test.includes(nameSecret)) {
            console.log('Handler KeyPair');
            key = await ec2.createKeyPair(nameSecret);
            await sm.createSecret(nameSecret, key);
        }

        console.log('Handler Instance');
        await ec2.createInstance(nameSecret);
    } catch (err) {
        throw new Error(`Function error: ${err}`);
    }
}