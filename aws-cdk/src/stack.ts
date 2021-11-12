import * as cdk from '@aws-cdk/core';
import Lambda from './lambda';
import Layer from './lambda/layer';
import { LambdaRole } from './lambda/role'
import { FunctionInfo } from './params';
import { context } from './utils';
// import * as sqs from '@aws-cdk/aws-sqs';

export class TpsStack extends cdk.Stack {
    constructor(scope: cdk.Construct, params: FunctionInfo) {
        const { region, account } = context(scope);
        const props = {
            env: { account, region }
        };
        super(scope, params.id, props);
        const layer = new Layer(this, params.id);
        const lambdaRole = new LambdaRole(this, params.id);
        for (const lambdaFunction of params.functions) {
            new Lambda(this, { methodParams: lambdaFunction, layer, lambdaRole })
        }
    }
}


