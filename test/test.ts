import { ApiPromise } from '@polkadot/api';
import {
    construct,
    getRegistry,
    methods,
} from '@substrate/txwrapper-polkadot';
import { httpRequest, signWith } from './utils';
import { KeyringPair } from '@polkadot/keyring/types';

export interface Params {
    id: number,
    jsonrpc: string,
    method: string,
    params?: number[] | string[]
}

export async function apiTransaction(pair: KeyringPair[], api: ApiPromise, from: number, to: number) {
    return new Promise((resolve, reject) => {
        try {
            console.log(to);
            resolve(api.tx.balances.transfer(pair[to].address, 1000).signAndSend(pair[from], { nonce: -1 }));
        } catch (err) {
            reject(err);
        }
    })
}

export async function httpTransaction(pair: KeyringPair, to: KeyringPair) {
    return new Promise(async (resolve, reject) => {
        try {
            const params: Params = {
                id: 1,
                jsonrpc: '2.0',
                method: ''
            };
            const index = await httpRequest({ ...params, method: 'system_accountNextIndex', params: [pair.address] });
            const { block } = await httpRequest({ ...params, method: 'chain_getBlock' });
            const blockHash = await httpRequest({ ...params, method: 'chain_getBlockHash' });
            const genesisHash = await httpRequest({ ...params, method: 'chain_getBlockHash', params: [0] });
            const metadataRpc = await httpRequest({ ...params, method: 'state_getMetadata' });
            const { specVersion, transactionVersion, specName } = await httpRequest({ ...params, method: 'state_getRuntimeVersion' });

            const registry = getRegistry({
                chainName: 'Polkadot',
                specName,
                specVersion,
                metadataRpc,
            });

            const unsigned = methods.balances.transferKeepAlive(
                {
                    value: '1000',
                    dest: to.address,
                },
                {
                    address: pair.address,
                    blockHash,
                    blockNumber: registry
                        .createType('BlockNumber', block.header.number)
                        .toNumber(),
                    eraPeriod: 64,
                    genesisHash,
                    metadataRpc,
                    nonce: index,
                    specVersion,
                    tip: 0,
                    transactionVersion,
                },
                {
                    metadataRpc,
                    registry,
                }
            );

            const signingPayload = construct.signingPayload(unsigned, { registry });

            const signature: any = signWith(pair, signingPayload, {
                metadataRpc,
                registry,
            });
            const tx = construct.signedTx(unsigned, signature, {
                metadataRpc,
                registry,
            });

            resolve(httpRequest({ ...params, method: 'author_submitExtrinsic', params: [tx] }));
        } catch (err: any) {
            console.log('error: ', err);
            reject(err)
        }
    })
}