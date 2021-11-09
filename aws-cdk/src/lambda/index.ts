import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import { context, getStage } from '../utils';
import { Method } from '../params';
import Layer from './layer';
import { LambdaRole } from './role';
import Api from '../api.ts';

interface FunctionParams {
    methodParams: Method,
    layer: Layer,
    lambdaRole: LambdaRole,
}

export default class Lambda extends lambda.Function {
    private readonly api: Api;
    public constructor(scope: cdk.Construct, params: FunctionParams) {
        const { methodParams, layer, lambdaRole } = params;
        const stage = getStage(scope);
        const { account } = context(scope);
        const environment: { [key: string]: string } = {
            PROC_MODE: stage,
            AWS_ID: account,
        };
        const functionName = `${methodParams.functionName}_${stage}`;

        super(scope, functionName, {
            functionName,
            code: lambda.Code.fromAsset(`../.dist/lambda/${methodParams.functionName}`),
            handler: 'index.handler',
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk.Duration.seconds(900),
            memorySize: methodParams.memory,
            environment,
            layers: [layer],
            role: lambdaRole,
        });
        this.api = new Api(this, methodParams);
        this.api.addMethod(this, methodParams.apiResource, methodParams.apiMethod);
    }
}