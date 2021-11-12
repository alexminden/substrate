import * as cdk from '@aws-cdk/core';

interface Scope {
    region: string;
    account: string;
}

export function context(scope: cdk.Construct): Scope {
    try {
        return {
            region: scope.node.tryGetContext('region'),
            account: scope.node.tryGetContext('account'),
        };
    } catch (err) {
        throw new Error(`Function error: ${err}`);
    }
}

export function getStage(scope: cdk.Construct): string {
    try {
        return scope.node.tryGetContext('stage');
    } catch (err) {
        throw new Error(`Function error: ${err}`);
    }
}