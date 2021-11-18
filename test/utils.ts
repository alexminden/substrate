import axios from 'axios';
import { KeyringPair } from '@polkadot/keyring/types';
import { EXTRINSIC_VERSION } from '@polkadot/types/extrinsic/v4/Extrinsic';
import { createMetadata, OptionsWithMeta } from '@substrate/txwrapper-polkadot';
import { Params } from './test';

export interface Result {
    jsonrpc: string,
    result: any,
    id: number
}

export async function httpRequest(params: Params): Promise<any> {
    try {
        const { data } = await axios.post(
            "http://127.0.0.1:9933",
            params,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
            }
        )
        const res = data as Result;
        return res.result;
    } catch (err) {
        console.log('Axios Error: ', err);
    }
}

export function signWith(
    pair: KeyringPair,
    signingPayload: string,
    options: OptionsWithMeta
): string {
    const { registry, metadataRpc } = options;
    registry.setMetadata(createMetadata(registry, metadataRpc));

    const { signature } = registry
        .createType('ExtrinsicPayload', signingPayload, {
            version: EXTRINSIC_VERSION,
        })
        .sign(pair);

    return signature;
}