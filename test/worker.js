console.log('worker.js started')
require('ts-node').register() // 重要
require(__dirname + '/worker.ts')