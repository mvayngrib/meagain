const { EventEmitter } = require('events')
const timeoutMixin = require('./timeout-mixin')
const logger = require('./utils').logger()
const {
  FOREGROUND_APP
} = require('./events')

const {
  getForegroundApp,
  getCurrentItunesTrack,
  getTabsForAllBrowsers,
} = require('./jxa')

const DEFAULT_INTERVAL = 1000

const createMonitor = (opts={}) => {
  const defaultInterval = opts.interval || DEFAULT_INTERVAL
  const ee = new EventEmitter()
  timeoutMixin.mixin(ee)

  // internal
  const checkForegroundApp = async () => {
    try {
      ee.emit(FOREGROUND_APP, await getForegroundApp())
    } catch (err) {
      logger.error(err.message)
    }
  }

  // external
  ee.monitorForegroundApp = (interval=defaultInterval) => ee.setInterval(checkForegroundApp, interval)
  ee.stop = () => ee.clearTimers()

  return ee
}

module.exports = createMonitor
