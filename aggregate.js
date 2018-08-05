const cloneDeep = require('lodash/cloneDeep')
const map = require('lodash/map')

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

  const toAggArray = aggregates => map(aggregates, (agg, app) => ({
    ...agg,
    app,
  }))

  const summarize = aggregates => {
    const byApp = cloneDeep(aggregates)
    const current = changes.getCurrentEvent()
    if (current) {
      addEvent(byApp, current)
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
