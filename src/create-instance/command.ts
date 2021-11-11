import { SSHConnection } from 'node-ssh-forward'

export async function makeCommand(privateKey: string, publicDnsName: string) {
    try {
        const sshConnection = new SSHConnection({
            username: 'ubuntu',
            endHost: publicDnsName,
            privateKey
        });
        console.log('ssh Connection: ', sshConnection);
        await sshConnection.executeCommand('sudo apt-get update');
        await sshConnection.executeCommand("curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh");
        await sshConnection.executeCommand('source $HOME/.cargo/env');
        await sshConnection.executeCommand('rustup default stable && rustup update && rustup update nightly && rustup target add wasm32-unknown-unknown --toolchain nightly');
        await sshConnection.executeCommand('sudo apt update && sudo apt install -y git clang curl libssl-dev llvm libudev-dev');
    } catch (err) {
        console.log('makeCommand error: ', err);
        throw err;
    }
}