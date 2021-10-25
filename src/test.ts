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
export interface Result {
    jsonrpc: string,
    result: any,
    id: number
}

export async function apiTransaction(pair: KeyringPair[], api: ApiPromise) {
    const txHash = await api.tx.balances.transfer(pair[5].address, 1000).signAndSend(pair[0]);
    console.log('Api Transaction: ', txHash);
}

export async function httpTransaction(pair: KeyringPair[]) {
    const params: Params = {
        id: 1,
        jsonrpc: '2.0',
        method: ''
    };
    const index = await httpRequest({ ...params, method: 'system_accountNextIndex', params: [pair[0].address] });
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
            dest: pair[4].address,
        },
        {
            address: pair[0].address,
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

    const signature = signWith(pair[0], signingPayload, {
        metadataRpc,
        registry,
    });
    const tx = construct.signedTx(unsigned, signature, {
        metadataRpc,
        registry,
    });

    console.log('Transaction: ', tx);
    const transactionResult = await httpRequest({ ...params, method: 'author_submitExtrinsic', params: [tx] });
    console.log('Transaction result: ', transactionResult);
}