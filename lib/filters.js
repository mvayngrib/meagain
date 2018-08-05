const isEqual = require('lodash/isEqual')
const omit = require('lodash/omit')
const cloneDeep = require('lodash/cloneDeep')
const createEmitter = require('./emitter')
const neuterEvent = event => omit(event, '_start')
const defaultHasChanged = (a, b) => !isEqual(neuterEvent(a), neuterEvent(b))

const changes = (monitor, hasChanged=defaultHasChanged) => {
  const ee = createEmitter()
  const byName = {}
  let currentEvent
  monitor.on('**', function (data) {
    const { event } = this
    const prev = byName[event]
    if (hasChanged(prev, data)) {
      currentEvent = data
      byName[event] = data
      if (prev != null) {
        ee.emit(`${event}:end`, {
          ...prev,
          event,
          _end: Date.now(),
        })
      }

      ee.emit(`${event}:start`, {
        ...data,
        event,
      })

      return
    }
  })

  ee.getCurrentEvent = () => cloneDeep(currentEvent)

  return ee
}

module.exports = {
  changes
}
