import { SSHConnection } from 'node-ssh-forward'

export async function makeCommand(privateKey: string, publicDnsName: string, commands: string[]) {
    try {
        const sshConnection = new SSHConnection({
            username: 'ubuntu',
            endHost: publicDnsName,
            privateKey
        });
        console.log('ssh Connection: ', sshConnection);
        for(const command of commands) {
            await sshConnection.executeCommand(command);
        }
    } catch (err) {
        console.log('makeCommand error: ', err);
        throw err;
    }
}