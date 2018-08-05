const os = require('os')
const crypto = require('crypto')
const yn = require('yn')

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

const getTimePrefix = (timestamp, resolution='hour') => {
  const { year, month, day, hour, minute } = describeDate(timestamp)
  const dayPrefix = `${year}-${month}-${day}`
  if (resolution === 'day') {
    return dayPrefix
  }

  if (resolution === 'hour') {
    return `${dayPrefix}/${hour}:00`
  }

  if (resolution && resolution !== 'minute') {
    throw new Error(`invalid resolution: ${resolution}`)
  }

  return `${dayPrefix}/${hour}:${minute}`
}

const sha256 = strOrObj => {
  if (typeof strOrObj !== 'string') {
    strOrObj = JSON.stringify(strOrObj)
  }

  return crypto.createHash('sha256').update(strOrObj).digest('hex')
}

const getEventKey = event => {
  const { type, app, _start, } = event
  const hash = sha256(event).slice(0, 6)
  let eventName = `${app}-${hash}.json`
  if (type) eventName = `${type}-${eventName}`
  return `${getTimePrefix(_start)}/${eventName}`
}

const prettifySummary = summary => {
  let text = ''
  for (let app in summary) {
    let { time } = summary[app]
    let humanTime = humanizeTime(time)
    if (humanTime) {
      text += `${app}: ${humanTime}\n`
    }
  }

  return text
}

const unitToMillis = {
  year: 365 * 24 * 60 * 60000,
  month: 30 * 24 * 60 * 60000,
  day: 24 * 60 * 60000,
  hour: 60 * 60000,
  minute: 60000,
  second: 1000,
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

module.exports = {
  prettify,
  prettifySummary,
  createLogger,
  getEventKey,
  describeDate,
  humanizeTime,
  parseEnvVars,
  getHomedir,
}
