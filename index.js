const log = (...args) => console.log(...args)
const {
  FOREGROUND_APP,
} = require('./events')

const monitor = require('./monitor')({ interval: 1000 })
monitor.monitorForegroundApp()

const changes = require('./filters').changes(monitor)
changes.on('**', function (e) {
  console.log(this.event, e)
})
