const {
  FOREGROUND_APP,
} = require('./events')

const { getIdleTime, createLogger } = require('./utils')
const logger = createLogger()

const monitor = require('./monitor')({ interval: 1000 })
monitor.monitorForegroundApp()

const changes = require('./filters').changes(monitor)
changes.on('**', function (e) {
  // console.log(this.event, e)
})

const agg = require('./aggregate').trackTimePerApp(changes)

setInterval(() => {
  logger.logPretty(agg.summary())
}, 10000)
