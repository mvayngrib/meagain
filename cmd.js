const fs = require('fs')
const path = require('path')
const createMonitor = require('./monitor')
const withDefaults = require('lodash/defaults')
const defaults = require('./defaults')
const confPath = process.argv[2]
if (!confPath) {
  throw new Error('expected conf path as first argument')
}

if (!fs.existsSync(confPath)) {
  throw new Error(`file not found: ${confPath}`)
}

const conf = require(path.resolve(process.cwd(), confPath))

let store
if (conf.store && conf.store.s3) {
  const {
    profile='default',
    ...storeOpts
  } = conf.store.s3

  const AWS = require('aws-sdk')
  const createS3Store = require('./store/s3')
  const credentials = new AWS.SharedIniFileCredentials({ profile })
  AWS.config.credentials = credentials
  store = createS3Store({
    client: new AWS.S3(),
    ...storeOpts,
  })
}

const { trackMe } = require('./')

trackMe({
  store,
  monitor: createMonitor(withDefaults(conf.monitor, defaults.monitor)),
})
