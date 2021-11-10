import * as aws from 'aws-sdk';
import AWSXRay = require('aws-xray-sdk');

aws.config.update({ region: 'ap-northeast-1' });
AWSXRay.config([AWSXRay.plugins.EC2Plugin]);
export const AWS = AWSXRay.captureAWS(aws);

export * as ec2 from './ec2';
export * as sm from './sm';