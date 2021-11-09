import * as cdk from '@aws-cdk/core';
import { TpsStack } from '../src/stack';
import { TpsFunctions } from '../src/params';

const app = new cdk.App();
new TpsStack(app, {
  id: 'TpsApi',
  functions: TpsFunctions,
});
