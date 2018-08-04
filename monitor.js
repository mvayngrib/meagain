const withDefaults = require('lodash/defaults')
const createEmitter = require('./emitter')
const timerMixin = require('./timer-mixin')
const {
  createLogger,
  isIdle,
} = require('./utils')

const {
  FOREGROUND_APP
} = require('./events')

const defaults = require('./defaults')

const {
  getForegroundApp,
  getCurrentItunesTrack,
  getTabsForAllBrowsers,
} = require('./jxa')

const createMonitor = (opts={}) => {
  opts = withDefaults(defaults.monitor)

  const { interval, idleThreshold } = opts
  const logger = createLogger()
  const ee = createEmitter()

  timerMixin.mixin(ee)

  // internal
  const checkForegroundApp = async () => {
    const now = Date.now()
    if (isIdle(idleThreshold)) {
      ee.emit(FOREGROUND_APP, {
        app: '[idle]',
        type: 'system',
        _start: now,
      })

      return
    }

    try {
      const event = await getForegroundApp()
      ee.emit(FOREGROUND_APP, {
        ...event,
        _start: now,
      })
    } catch (err) {
      logger.error(err.stack)
    }
  }

  // external
  ee.monitorForegroundApp = () => ee.setInterval(checkForegroundApp, interval)
  ee.stop = () => ee.clearTimers()

  return ee
}

module.exports = createMonitor
