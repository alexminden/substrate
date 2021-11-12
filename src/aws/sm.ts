'use strict';
import { SecretListEntry } from 'aws-sdk/clients/secretsmanager';
import { AWS } from '.';

const secretsmanager = new AWS.SecretsManager({ apiVersion: '2017-10-17' });

export async function getParameter(name: string): Promise<string> {
    try {
        const params = {
            SecretId: name
        }
        const res = (await secretsmanager.getSecretValue(params).promise()).SecretString;
        return res!;
    } catch (err) {
        console.error('SSM error: ', err);
        throw err;
    }
}

export async function createSecret(name: string, res: string): Promise<void> {
    try {
        const secretParams = {
            Name: name,
            SecretString: `${res}`
        }
        await secretsmanager.createSecret(secretParams).promise();
    } catch (err) {
        console.log('Secret create error: ', err);
        throw err;
    }
}

export async function listKey(): Promise<(string | undefined)[]> {
    try {
        const res = (await secretsmanager.listSecrets().promise()).SecretList;
        const secretName = res?.map((secretParam: SecretListEntry) => secretParam.Name);
        console.log('List: ', secretName);
        return secretName!;
    } catch (err) {
        console.log('Secret list error: ', err);
        throw err;
    }

}