import * as path from 'path';
import * as shell from 'shelljs';
import { buildLayer, distLambda } from './build';

export const directories = {
    ROOT_DIR: path.resolve(__dirname, '../..'),
    DIST_DIR: path.join(__dirname, '../..', '.dist'),
    SRC_DIR: path.join(__dirname, '../..', 'src')
}

function main(): void {
    shell.exec('npm --prefix .. run clean');
    shell.mkdir('-p', directories.DIST_DIR);
    distLambda();
    buildLayer();
}

try {
    main();
    process.exit();
} catch (err) {
    console.error(err);
    process.exit(-1);
}
