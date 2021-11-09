import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'shelljs';
import { directories } from './index';

export function distLambda() {
    const dist = path.join(directories.DIST_DIR, 'lambda');
    shell.mkdir('-p', dist);
    const folders = fs.readdirSync(directories.SRC_DIR, { withFileTypes: true });
    folders
        .filter(folder => !folder.isFile() && folder.name != 'node_modules')
        .map(folder => {
            const funcFolder = path.join(directories.SRC_DIR, folder.name);
            const distFolder = path.join(dist, folder.name);
            shell.mkdir('-p', distFolder);
            shell.exec(`tsc ${path.join(funcFolder, 'index.ts')} --outDir ${distFolder}`);
        });
}

export function buildLayer(): void {
    const dst = path.join(directories.DIST_DIR, 'layer', 'nodejs');

    shell.mkdir('-p', dst);
    shell.cp(path.join(directories.ROOT_DIR, 'package.json'), dst);
    shell.cp(path.join(directories.ROOT_DIR, 'package-lock.json'), dst);
    shell.exec(`npm ci --prefix ${dst} --production`);
}