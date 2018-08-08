const omit = require('lodash/omit')
const isEqual = require('lodash/isEqual')
const cloneDeep = require('lodash/cloneDeep')
const createEmitter = require('./emitter')
const timerMixin = require('./timer-mixin')
const {
  createLogger,
} = require('./utils')

const {
  FOREGROUND_APP
} = require('./events')

const neuterEvent = event => event && omit(event, ['time', 'start'])
const hasChanged = (a, b) => !isEqual(neuterEvent(a), neuterEvent(b))

const createMonitor = opts => {
  const { system, interval, idleThreshold } = opts
  const logger = createLogger('monitor:')
  const ee = createEmitter()

  timerMixin.mixin(ee)

  let prevFGAppEvent

  const getFGEvent = async () => {
    if (system.isIdle(idleThreshold)) {
      return {
        app: 'system',
        type: 'idle',
        time: Date.now(),
      }
    }

    const app = await system.getForegroundApp()
    return {
      ...app,
      time: Date.now(),
    }
  }

  // internal
  const checkForegroundApp = async () => {
    let event
    try {
      event = await getFGEvent()
    } catch (err) {
      logger.error(err.stack)
      return
    }

    if (!hasChanged(event, prevFGAppEvent)) return

    if (prevFGAppEvent) {
      ee.emit(`${FOREGROUND_APP}:end`, {
        ...prevFGAppEvent,
        time: event.time,
        duration: event.time - prevFGAppEvent.time,
        end: true,
      })
    }

    prevFGAppEvent = cloneDeep(event)
    ee.emit(FOREGROUND_APP, { ...prevFGAppEvent, start: true })
  }

  // external
  ee.interval = interval

  let fgInterval
  ee.monitorForegroundApp = () => {
    if (!fgInterval) {
      fgInterval = ee.setInterval(checkForegroundApp, interval)
    }
  }

  ee.stop = () => ee.clearTimers()
  ee.getCurrentEvent = () => cloneDeep(prevFGAppEvent)

  return ee
}

module.exports = createMonitor
