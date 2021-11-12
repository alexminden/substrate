import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import { getStage } from '../utils';

export default class Layer extends lambda.LayerVersion {
    public constructor(scope: cdk.Construct, name: string) {
        const stage = getStage(scope);
        const layerName = `layer_${name}_${stage}`;
        super(scope, layerName, {
            code: lambda.Code.fromAsset('../.dist/layer'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
        });
    }
}