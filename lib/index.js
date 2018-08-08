const { createLogger } = require('./utils')
const { trackTimePerApp } = require('./aggregate')

const trackMe = ({ store, monitor }) => {
  const logger = createLogger('track')
  monitor.monitorForegroundApp()
  const aggregator = trackTimePerApp(monitor)

  const ret = { monitor, aggregator }
  if (!store) return ret

  monitor.on('**', async function (data) {
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

  return ret
}

module.exports = {
  trackMe,
}
