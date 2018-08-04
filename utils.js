const { IDLE_THRESHOLD } = require('./defaults')
const systemIdleTime = require('@paulcbetts/system-idle-time')

const prettify = obj => obj ? JSON.stringify(obj, null, 2) : ''
const prettifyArgs = args => args.length === 1 ? prettify(args[0]) : prettify(args)
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

const getIdleTime = () => systemIdleTime.getIdleTime()
const isIdle = (threshold=IDLE_THRESHOLD) => getIdleTime() > threshold

module.exports = {
  prettify,
  createLogger,
  getIdleTime,
  isIdle,
}
