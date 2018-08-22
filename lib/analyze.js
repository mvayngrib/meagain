const map = require('lodash/map')
const Table = require('cli-table')
const {
  humanizeDuration,
  roundUpToUnit,
} = require('./utils')

const {
  unitToMillis,
} = require('./constants')

const withPercents = aggregates => {
  const total = aggregates.reduce((total, { time }) => total + time, 0)
  return aggregates.map(agg => ({
    ...agg,
    percent: (100 * agg.time / total).toFixed(1)
  }))
}

const timeDesc = (a, b) => b.time - a.time
const toAggArray = aggregates => map(aggregates, (agg, app) => ({
  ...agg,
  app,
}))

const humanizeDurationWithNormalUnits = duration => humanizeDuration(duration, ['year', 'month', 'day', 'hour', 'minute', 'second'])
const getAppRow = ({ app, percent, time }) => [
  app,
  percent,
  humanizeDurationWithNormalUnits(time),
]

const printSummary = summary => {
  const stats = withPercents(toAggArray(summary.stats)).sort(timeDesc)
  const table = new Table({
    head: ['Application', '%', 'time'],
    colWidths: [30, 20, 20],
  })

  table.push(...stats.map(getAppRow))
  const tableStr = table.toString()
  const timePassed = roundUpToUnit(Date.now() - summary.start, unitToMillis.minute)
  return [
    `activity summary for the last ${humanizeDurationWithNormalUnits(timePassed)}:`,
    tableStr,
  ].join('\n\n')
}

module.exports = {
  withPercents,
  printSummary,
}
