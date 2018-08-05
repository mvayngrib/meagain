const withDefaults = require('lodash/defaults')
const AWS = require('aws-sdk')
const defaults = require('../defaults')
const createS3Client = require('../s3-client')
const { trackMe } = require('../')
const createMonitor = require('../monitor')

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
  return createS3Store({
    client: createS3Client(profile),
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
