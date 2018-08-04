const logUpdate = require('log-update')
const { createLogger, prettifySummary } = require('./utils')
const { trackTimePerApp } = require('./aggregate')
const filters = require('./filters')

const trackMe = ({ store, monitor }) => {
  const logger = createLogger()
  monitor.monitorForegroundApp()
  const changes = filters.changes(monitor)
  const agg = trackTimePerApp(changes)
  const start = Date.now()
  const getMinutesPassed = () => Math.ceil((Date.now() - start) / 60000)
  const printSummary = () => {
    const activitySummary = prettifySummary(agg.summary())
    logUpdate(`
polling interval: ${monitor.interval}ms
storing events: ${store || false}
activity summary for the last ${getMinutesPassed()} minutes:
${activitySummary}`)
  }

  setInterval(printSummary, monitor.interval)

  if (!store) return

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
}

module.exports = {
  trackMe,
}
