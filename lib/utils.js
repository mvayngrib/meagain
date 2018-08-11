const os = require('os')
const crypto = require('crypto')
const debug = require('debug')
const each = require('lodash/each')
const { unitToMillis, UI_TYPE } = require('./constants')
const wait = millis => {
  const start = Date.now()
  const end = start + millis
  let timeLeft
  let current
  const _wait = async () => {
    while ((timeLeft = end - Date.now()) > 0) {
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, timeLeft)
        current = { timeout, resolve }
      })
    }
  }

  const promise = _wait()
  promise.cancel = () => {
    if (current) {
      clearTimeout(current.timeout)
      current.resolve()
    }
  }

  return promise
}

const prettify = obj => obj ? JSON.stringify(obj, null, 2) : ''
const prettifyArgs = args => args.length === 1 ? prettify(args[0]) : prettify(args)

/* eslint-disable */
const createLogger = (namespace='') => {
  const wrapper = {
    log: debug(`${namespace}`),
    debug: debug(`debug:${namespace}`),
    info: debug(`info:${namespace}`),
    warn: debug(`warn:${namespace}`),
    error: debug(`error:${namespace}`),
  }

  const api = {}
  each(wrapper, (fn, name) => {
    api[name] = (...args) => fn(...args)
    api[`${name}Pretty`] = (...args) => fn(prettifyArgs(args))
  })

  return api
}
/* eslint-enable */

const defaultLogger = createLogger('main')

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

const validateResolution = resolution => {
  if (!(resolution in unitToMillis)) {
    throw new Error(`invalid resolution: ${resolution}`)
  }
}

const validateTimestamp = timestamp => {
  if (typeof timestamp !== 'number') {
    throw new Error('expected number timestamp')
  }
}

const getFilenameForTimeRange = (timestamp, resolution) => {
  validateTimestamp(timestamp)
  validateResolution(resolution)
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
  validateTimestamp(timestamp)
  validateResolution(resolution)
  if (resolution !== 'minute') {
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

// timestamp -> 1 days, 4 hours, 2 minutes, 10 seconds
const humanizeDuration = (duration, units) => (units || Object.keys(unitToMillis)).reduce((str, unit) => {
  const unitValue = unitToMillis[unit]
  const val = Math.floor(duration / unitValue)
  if (val === 0) return str

  duration -= val * unitValue
  const suffix = val === 1 ? '' : 's'
  const added = `${val} ${unit}${suffix}`
  return str.length ? `${str}, ${added}` : added
}, '')

const parseEnvVars = ({ MEAGAIN_UI }) => ({
  'shellUi': MEAGAIN_UI in UI_TYPE ? MEAGAIN_UI : null,
})

const getHomedir = () => process.env.HOME || os.homedir()
const roundDownToUnit = (time, unit) => unit * Math.floor(time / unit)
const roundUpToUnit = (time, unit) => unit * Math.ceil(time / unit)

const splitCamelCase = (str, delimiter = ' ') => {
  return str.slice(0, 1) + str.slice(1)
    .replace(/([A-Z])/g, delimiter + '$1')
    .trim()
}

module.exports = {
  prettify,
  createLogger,
  describeDate,
  humanizeDuration,
  parseEnvVars,
  getHomedir,
  wait,
  getFilenameForTime,
  getFilenameForTimeRange,
  roundDownToUnit,
  roundUpToUnit,
  sha256,
  defaultLogger,
  splitCamelCase,
}
