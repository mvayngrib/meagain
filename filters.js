const isEqual = require('lodash/isEqual')
const createEmitter = require('./emitter')
const isNotEqual = (...args) => !isEqual(...args)

const changes = (monitor, hasChanged=isNotEqual) => {
  const ee = createEmitter()
  const byName = {}
  monitor.on('**', function (data) {
    const { event } = this
    const prev = byName[event]
    if (hasChanged(prev, data)) {
      byName[event] = data
      if (prev != null) {
        ee.emit(`${event}:end`, prev)
      }

      ee.emit(`${event}:start`, data)
      return
    }

  })

  return ee
}

module.exports = {
  changes
}
