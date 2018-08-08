const cloneDeep = require('lodash/cloneDeep')
const map = require('lodash/map')

const createAggregate = () => ({
  time: 0
})

const trackTimePerApp = monitor => {
  const tracker = {}
  const aggregates = {}
  const addEndEvent = (aggregates, data) => {
    const { app } = data
    if (!aggregates[app]) {
      aggregates[app] = createAggregate()
    }

    const agg = aggregates[app]
    const { duration } = data
    agg.time += duration
  }

  monitor.on('**:end', data => addEndEvent(aggregates, data))

  const toAggArray = aggregates => map(aggregates, (agg, app) => ({
    ...agg,
    app,
  }))

  const summarize = aggregates => {
    const current = monitor.getCurrentEvent()
    const byApp = cloneDeep(aggregates)
    if (current) {
      addEndEvent(byApp, {
        ...current,
        duration: Date.now() - current.time
      })
    }

    const summary = toAggArray(byApp)
    return withPercents(summary)
      .sort(timeDesc)
  }

  const withPercents = aggregates => {
    const total = aggregates.reduce((total, { time }) => total + time, 0)
    return aggregates.map(agg => ({
      ...agg,
      percent: (100 * agg.time / total).toFixed(1)
    }))
  }

  tracker.summary = () => summarize(aggregates)
  return tracker
}

const timeDesc = (a, b) => b.time - a.time

module.exports = {
  trackTimePerApp
}
