const cloneDeep = require('lodash/cloneDeep')

const createAggregate = () => ({
  time: 0
})

const trackTimePerApp = monitor => {
  const tracker = {}
  const summary = createBlankSummary()

  monitor.on('**:end', data => addEndEvent(summary, data))

  const getCurrentSummary = summary => {
    const current = monitor.getCurrentEvent()
    const byApp = cloneDeep(summary)
    if (current) {
      addEndEvent(byApp, {
        ...current,
        duration: Date.now() - current.time
      })
    }

    return byApp
  }

  tracker.summary = () => getCurrentSummary(summary)
  return tracker
}

const createBlankSummary = () => ({
  start: Date.now(),
  stats: {}
})

const addEndEvent = (summary, data) => {
  const { app } = data
  const { stats } = summary
  if (!stats[app]) {
    stats[app] = createAggregate()
  }

  const agg = stats[app]
  const { duration } = data
  agg.time += duration
}

module.exports = {
  trackTimePerApp,
  createBlankSummary,
  addEndEvent,
  createAggregate,
}
