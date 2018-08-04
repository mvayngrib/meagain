const createEmitter = require('./emitter')
const timerMixin = require('./timer-mixin')
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
  const ee = createEmitter()

  timerMixin.mixin(ee)

  // internal
  const checkForegroundApp = async () => {
    try {
      const event = await getForegroundApp()
      ee.emit(FOREGROUND_APP, {
        ...event,
        _start: Date.now(),
      })
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
