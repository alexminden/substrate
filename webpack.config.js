'use strict';
const fs = require('fs');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

const ROOT_DIR = path.resolve(__dirname);
const SRC_DIR = path.join(ROOT_DIR, 'src');
// const PARAM_DIR = path.join(ROOT_DIR, 'aws-cdk', 'src');

const entry = {
    ...entries('create-instance'),
};

const output = {
    filename: '[name].js',
    path: path.join(ROOT_DIR, '.dist', 'lambda'),
    libraryTarget: 'commonjs2',
};

module.exports = {
    entry,
    externals: [nodeExternals()],
    externalsPresets: {
        node: true // in order to ignore built-in modules like path, fs, etc. 
    },
    mode: 'development',

    module: {
        rules: [
            {
                include: [
                    SRC_DIR,
                ],
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                },
            },
        ]
    },
    output,

    resolve: {
        extensions: ['.ts'],
        alias: {
            'src': SRC_DIR,
        },
        modules: [
            SRC_DIR,
            'node_modules',
        ],
    },
    target: 'node',
};

function entries(dirname) {
    const retval = {};

    const dirpath = path.join(SRC_DIR, `${dirname}`);
    const targets = fs.readdirSync(dirpath, { withFileTypes: true });
    for (const dirent of targets) {
        retval[`${dirname}/index`] = path.join(dirpath, 'index.ts');
    }

    return retval;
}
