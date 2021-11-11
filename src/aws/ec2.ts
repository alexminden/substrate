import { Instance, InstanceList, Reservation } from "aws-sdk/clients/ec2";
import { AWS } from ".";

const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });

export async function createKeyPair(name: string): Promise<string> {
    try {
        const params = {
            KeyName: name,
        };
        const res = (await ec2.createKeyPair(params).promise()).KeyMaterial;
        return res!;
    } catch (err) {
        console.log('createKeyPair error: ', err);
        throw err;
    }
}

export async function createInstance(key: string): Promise<void> {
    try {
        const instanceParams = {
            BlockDeviceMappings: [
                {
                    DeviceName: '/dev/sda1',
                    Ebs: {
                        VolumeSize: 100,
                        VolumeType: 'gp2'
                    }
                }
            ],
            ImageId: 'ami-036d0684fc96830ca',
            InstanceType: 't2.micro',
            KeyName: key,
            MinCount: 1,
            MaxCount: 1,
            SecurityGroupIds: [
                'sg-0707bdda95c2470d8'
            ]
        };

        const res = (await ec2.runInstances(instanceParams).promise()).Instances;
        console.log('Result: ', res);
    } catch (err) {
        console.log('createInstance error: ', err);
        throw err;
    }
}

export async function getInstances(): Promise<Instance[]> {
    try {
        let instances: (InstanceList | undefined)[] = [];
        const res = (await ec2.describeInstances().promise()).Reservations;
        if (res) {
            instances = res
                .map((instance: Reservation) => instance.Instances)
                .filter((instance: any) => instance[0].PrivateIpAddress)
                .map((instance: any) => instance[0])
        }
        console.log(instances);
        return instances as Instance[];
    } catch (err) {
        console.log('getInstances error: ', err);
        throw err;
    }
}