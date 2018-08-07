const os = require('os')
const crypto = require('crypto')
const yn = require('yn')
const Table = require('cli-table')
const { unitToMillis } = require('./constants')
const wait = async millis => {
  const start = Date.now()
  const end = start + millis
  let timeLeft
  while ((timeLeft = end - Date.now()) > 0) {
    await new Promise(resolve => setTimeout(resolve, timeLeft))
  }
}

const prettify = obj => obj ? JSON.stringify(obj, null, 2) : ''
const prettifyArgs = args => args.length === 1 ? prettify(args[0]) : prettify(args)

/* eslint-disable */
const createLogger = () => ({
  log: (...args) => console.log(...args),
  logPretty: (...args) => console.log(prettifyArgs(args)),
  info: (...args) => console.info(...args),
  infoPretty: (...args) => console.info(prettifyArgs(args)),
  warn: (...args) => console.warn(...args),
  warnPretty: (...args) => console.warn(prettifyArgs(args)),
  error: (...args) => console.error(...args),
  errorPretty: (...args) => console.error(prettifyArgs(args)),
})
/* eslint-enable */

const leftPad = (value, length) => {
  value = String(value)
  if (value.length < length) {
    return '0'.repeat(length - value.length) + value
  }

  return value
}

const describeDate = timestamp => {
  const date = new Date(timestamp)
  const day = date.getUTCDate()
  const month = date.getUTCMonth() + 1
  const year = date.getUTCFullYear()
  return {
    day: leftPad(day, 2),
    month: leftPad(month, 2),
    year: String(year),
    hour: leftPad(date.getUTCHours(), 2),
    minute: leftPad(date.getUTCMinutes(), 2),
  }
}

const getFilenameForTimeRange = (timestamp, resolution) => {
  const left = getFilenameForTime(timestamp, resolution)
  let right = getFilenameForTime(timestamp + unitToMillis[resolution], resolution)
  let rightIdx
  for (let i = 0; i < left.length; i++) {
    if (right[i] !== left[i]) {
      rightIdx = i
      break
    }
  }

  right = right.slice(rightIdx)
  return `${left}-${right}`
}

const getFilenameForTime = (timestamp, resolution='hour') => {
  if (resolution !== 'minute') {
    if (!(resolution in unitToMillis)) {
      throw new Error(`invalid resolution: ${resolution}`)
    }

    return getFilenameForTime(roundDownToUnit(timestamp, unitToMillis[resolution]), 'minute')
  }

  const { year, month, day, hour, minute } = describeDate(timestamp)
  const dayPrefix = `${year}-${month}-${day}`

  return `${dayPrefix}/${hour}:${minute}`
}

const sha256 = strOrObj => {
  if (typeof strOrObj !== 'string') {
    strOrObj = JSON.stringify(strOrObj)
  }

  return crypto.createHash('sha256').update(strOrObj).digest('hex')
}

const getAppRow = ({ app, percent, time }) => [app, percent, humanizeTime(time)]

const prettifySummary = summary => {
  const table = new Table({
    head: ['Application', '%', 'time'],
    colWidths: [30, 20, 20],
  })

  table.push(...summary.map(getAppRow))
  return table.toString()
}

// timestamp -> 1 days, 4 hours, 2 minutes, 10 seconds
const humanizeTime = time => Object.keys(unitToMillis).reduce((str, unit) => {
  const unitValue = unitToMillis[unit]
  const val = Math.floor(time / unitValue)
  if (val === 0) return str

  time -= val * unitValue
  const added = `${val} ${unit}s`
  return str.length ? `${str}, ${added}` : added
}, '')

const parseEnvVars = ({ SILENT }) => ({
  silent: yn(SILENT),
})

const getHomedir = () => process.env.HOME || os.homedir()
const roundDownToUnit = (time, unit) => {
  return unit * Math.floor(time / unit)
}

const getItemTime = item => item._start || item._end

module.exports = {
  prettify,
  prettifySummary,
  createLogger,
  describeDate,
  humanizeTime,
  parseEnvVars,
  getHomedir,
  wait,
  getFilenameForTime,
  getFilenameForTimeRange,
  getItemTime,
  roundDownToUnit,
  sha256,
}
