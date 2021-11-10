import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';
import { getStage } from '../utils';

export class LambdaRole extends iam.Role {
    public constructor(scope: cdk.Construct, name: string) {
        const stage = getStage(scope);
        const roleName = `${name}_LambdaRole_${stage}`;
        super(scope, roleName, {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaRole'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('AWSLambdaExecute'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2FullAccess'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('SecretsManagerReadWrite'),
            ],
            roleName,
        });
    }
}

export class ApiRole extends iam.Role {
    public constructor(scope: cdk.Construct, name: string) {
        const stage = getStage(scope);
        const roleName = `${name}_ApiRole_${stage}`;
        super(scope, roleName, {
            assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaRole'),
            ],
            roleName,
        });
    }
}