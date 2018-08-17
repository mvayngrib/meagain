const fs = require('fs')
const path = require('path')
const withDefaults = require('lodash/defaults')
const logUpdate = require('log-update')
const defaults = require('../defaults')
const createS3Client = require('../aws/s3-client')
const { trackMe } = require('../')
const { createBlankSummary, addEndEvent } = require('../aggregate')
const { printSummary } = require('../analyze')
const createMonitor = require('../monitor')
const {
  // SUMMARY_PATH,
  CONF_DIR,
  SUMMARY_PATH,
  UI_TYPE,
  unitToMillis,
} = require('../constants')

const {
  prettify,
} = require('../utils')
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

const track = ({ conf, system, shellUi }) => {
  const log = getLog()
  const logStore = getLogStore(log)

  let syncTime
  const setupS3Sync = (s3Conf) => {
    const { sync } = require('../sync-to-s3')
    const s3Store = createS3Store(s3Conf)
    log.onready().then(() => {
      sync({
        log,
        s3Store,
        resolution: s3Conf.resolution,
        onSync: () => {
          syncTime = new Date().toString()
        },
      })
    })
  }

  const monitor = createMonitor({
    ...withDefaults(conf.monitor, defaults.monitor),
    system,
  })

  if (conf.store && conf.store.s3) {
    setupS3Sync(conf.store.s3)
  }

  const { aggregator } = trackMe({ store: logStore, monitor })
  const uiUpdateInterval = shellUi === UI_TYPE.gui ? monitor.interval : unitToMillis.minute
  const outputSummary = ({ summary }) => {
    const summaryStr = printSummary(summary)
    const lines = [
      summaryStr
    ]

    if (syncTime) {
      lines.push(`last sync to S3: ${syncTime}`)
    }

    if (shellUi === UI_TYPE.gui) {
      logUpdate(lines.join('\n\n'))
    } else {
      // eslint-disable-next-line no-console
      console.log(lines.join('\n\n'))
    }
  }

  const updateSummary = event => {
    const summary = getSavedSummary()
    addEndEvent(summary, event)
    saveSummary(summary)
  }

  monitor.on('**:end', updateSummary)

  if (shellUi === UI_TYPE.none) return

  const start = Date.now()
  setInterval(() => {
    const summary = aggregator.summary()
    if (shellUi !== UI_TYPE.none) {
      outputSummary({ start, summary })
    }
  }, uiUpdateInterval)
}

const getLog = () => createLog.fromPath(path.resolve(CONF_DIR, 'log.db'))
const getLogStore = log => createLogStore.fromLog(log)
const getSavedSummary = () => {
  try {
    return JSON.parse(fs.readFileSync(SUMMARY_PATH))
  } catch (err) {
    return createBlankSummary()
  }
}

const saveSummary = summary => fs.writeFileSync(SUMMARY_PATH, prettify(summary))

module.exports = {
  getLog,
  getLogStore,
  track,
}
