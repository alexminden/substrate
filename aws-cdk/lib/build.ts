import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'shelljs';
import { directories } from './index';

export function buildLayer(): void {
    const dst = path.join(directories.DIST_DIR, 'layer', 'nodejs');

    shell.mkdir('-p', dst);
    shell.cp(path.join(directories.ROOT_DIR, 'package.json'), dst);
    shell.cp(path.join(directories.ROOT_DIR, 'package-lock.json'), dst);
    shell.exec(`npm ci --prefix ${dst} --production`);
}