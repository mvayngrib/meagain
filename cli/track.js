const path = require('path')
const withDefaults = require('lodash/defaults')
const AWS = require('aws-sdk')
const defaults = require('../defaults')
const { trackMe } = require('../')
const createMonitor = require('../monitor')
const { getHomedir } = require('../utils')

const createS3Store = conf => {
  const {
    profile=defaults.aws.profile,
    region,
    ...storeOpts
  } = conf

  if (region) {
    AWS.config.update({ region })
  }

  const createS3Store = require('../store/s3')
  const credentials = new AWS.SharedIniFileCredentials({
    profile,
    filename: path.resolve(getHomedir(), '.aws/credentials'),
  })

  AWS.config.credentials = credentials
  return createS3Store({
    client: new AWS.S3(),
    ...storeOpts,
  })
}

module.exports = ({ conf, system }) => {
  let store
  if (conf.store && conf.store.s3) {
    store = createS3Store(conf.store.s3)
  }

  const monitor = createMonitor({
    ...withDefaults(conf.monitor, defaults.monitor),
    system,
  })

  trackMe({ store, monitor })
}
