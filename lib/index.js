const logUpdate = require('log-update')
const createEmitter = require('./emitter')
const {
  createLogger,
  prettifySummary,
  humanizeTime
} = require('./utils')

const { trackTimePerApp } = require('./aggregate')
const filters = require('./filters')

const printSummary = ({ start, summary }) => {
  const activitySummary = prettifySummary(summary)
  logUpdate(`
activity summary for the last ${humanizeTime(Date.now() - start)} minutes:

${activitySummary}`)
}

const trackMe = ({ store, monitor, silent }) => {
  const ee = createEmitter()
  const logger = createLogger()
  monitor.monitorForegroundApp()
  const changes = filters.changes(monitor)
  const agg = trackTimePerApp(changes)
  // const start = Date.now()

  setInterval(() => {
    const summary = agg.summary()
    ee.emit('summary', summary)
    // if (!silent) {
    //   printSummary({ start, summary })
    // }
  }, monitor.interval)

  if (!store) return ee

  changes.on('**', async (data) => {
    const { event } = this
    try {
      await store.put(data)
    } catch(err) {
      logger.errorPretty('failed to save event', {
        error: err.stack,
        event,
        data,
      })
    }
  })

  return ee
}

module.exports = {
  trackMe,
}
