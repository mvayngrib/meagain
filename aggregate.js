const cloneDeep = require('lodash/cloneDeep')

const trackTimePerApp = ee => {
  const tracker = {}
  const aggregate = {}
  ee.on('**:end', function (data) {
    const { app, type } = data
    if (!aggregate[app]) {
      aggregate[app] = {
        time: 0
      }
    }

    const agg = aggregate[app]
    agg.time += data._end - data._start
  })

  tracker.summary = () => cloneDeep(aggregate)
  return tracker
}

module.exports = {
  trackTimePerApp
}
