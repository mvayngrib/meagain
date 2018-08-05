const withDefaults = require('lodash/defaults')
const defaults = require('../defaults')
const createS3Client = require('../aws/s3-client')
const { trackMe } = require('../')
const createMonitor = require('../monitor')

const createS3Store = conf => {
  const AWS = require('aws-sdk')
  const {
    profile=defaults.aws.profile,
    region,
    ...storeOpts
  } = conf

  if (region) {
    AWS.config.update({ region })
  }

  const createStore = require('../store/s3')
  return createStore({
    client: createS3Client(profile),
    ...storeOpts,
  })
}

module.exports = ({ conf, system }) => {
  let store
  if (conf.store) {
    // if (conf.store.s3) {
    //   store = createS3Store(conf.store.s3)
    // }

    if (conf.store.local) {
      store = require('../store/log')(conf.store.local.log)
    }
  }

  const monitor = createMonitor({
    ...withDefaults(conf.monitor, defaults.monitor),
    system,
  })

  trackMe({ store, monitor })
}
