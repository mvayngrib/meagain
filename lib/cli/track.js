const fs = require('fs')
const path = require('path')
const withDefaults = require('lodash/defaults')
const defaults = require('../defaults')
const createS3Client = require('../aws/s3-client')
const { trackMe } = require('../')
const createMonitor = require('../monitor')
const { SUMMARY_PATH, CONF_DIR } = require('../constants')
const { prettify } = require('../utils')
const createLog = require('../log')
const createLogStore = require('../store/log')

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
  const log = createLog.fromPath(path.resolve(CONF_DIR, 'log.db'))
  const logStore = createLogStore.fromLog(log)
  if (conf.store) {
    const s3Conf = conf.store.s3
    if (s3Conf) {
      const { sync } = require('../sync-to-s3')
      const s3Store = createS3Store(s3Conf)
      log.onready().then(() => {
        sync({
          log,
          s3Store,
          resolution: s3Conf.resolution,
        })
      })
    }
  }

  const monitor = createMonitor({
    ...withDefaults(conf.monitor, defaults.monitor),
    system,
  })

  trackMe({ store: logStore, monitor }).on('summary', saveSummary)
}

const saveSummary = summary => fs.writeFileSync(SUMMARY_PATH, prettify(summary))
