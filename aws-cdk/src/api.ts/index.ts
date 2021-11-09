import * as api from '@aws-cdk/aws-apigateway';
import { IResource } from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import { ApiRole } from '../lambda/role';
import { Method } from '../params';
import { ApiMethods } from '../params';
import { getStage } from '../utils';

const METHOD_OPTIONS = {
    apiKeyRequired: true,
    methodResponses: [
        { statusCode: '200' },
        { statusCode: '400' },
        { statusCode: '401' },
        { statusCode: '403' },
        { statusCode: '404' },
        { statusCode: '500' },
        { statusCode: '503' },
    ],
};

export default class Api extends api.RestApi {
    private readonly apiRole: ApiRole;
    private readonly resources: { [key: string]: api.Resource };

    public constructor(scope: cdk.Construct, functions: Method) {
        const stage = getStage(scope);
        const restApiName = `${functions.apiName}_Api_${stage}`;
        super(scope, 'API', {
            defaultMethodOptions: METHOD_OPTIONS,
            restApiName,
            deployOptions: {
                stageName: stage,
                dataTraceEnabled: true,
                loggingLevel: api.MethodLoggingLevel.INFO,
            },
        });
        this.apiRole = new ApiRole(scope, functions.apiName);
        this.resources = {};
        this.createUsagePlan(stage);
        this.createResources(functions.apiResource, this.root, '');
    }

    private createUsagePlan(stage: string): void {
        const apiKey = this.createApiKey(stage);
        const name = `TpsApiPlan_${stage}`;
        const plan = this.addUsagePlan(name, {
            name,
            apiKey,
        });
        plan.addApiStage({ stage: this.deploymentStage });
    }

    private createApiKey(stage: string): api.ApiKey {
        const apiKeyName = `TpsApiKey_${stage}`;
        return new api.ApiKey(this, apiKeyName, {
            resources: [this],
            apiKeyName,
        });
    }

    private createResources(resources: string, root: IResource, rootName: string): void {
        const resource = root.addResource(resources);
        this.resources[`${resources}`] = resource;
    }

    public addMethod(fn: lambda.IFunction, resource: string, method: ApiMethods): void {
        const integ = this.createIntegration(fn);
        this.resources[resource].addMethod(method, integ);
    }

    private createIntegration(fn: lambda.IFunction): api.LambdaIntegration {
        return new api.LambdaIntegration(fn, {
            credentialsRole: this.apiRole,
            passthroughBehavior: api.PassthroughBehavior.WHEN_NO_TEMPLATES,
            proxy: true,
        });
    }
}