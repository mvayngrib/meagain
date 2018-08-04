const cloneDeep = require('lodash/cloneDeep')

const createAggregate = () => ({
  time: 0
})

const trackTimePerApp = changes => {
  const tracker = {}
  const aggregates = {}
  const addEvent = (aggregates, data) => {
    const { app } = data
    if (!aggregates[app]) {
      aggregates[app] = createAggregate()
    }

    const agg = aggregates[app]
    const {
      _start,
      _end=Date.now(),
    } = data

    agg.time += _end - _start
  }

  changes.on('**:end', data => addEvent(aggregates, data))

  tracker.summary = () => {
    const dump = cloneDeep(aggregates)
    const current = changes.getCurrentEvent()
    if (current) {
      addEvent(dump, current)
    }

    return dump
  }

  return tracker
}

module.exports = {
  trackTimePerApp
}
