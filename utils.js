const { IDLE_THRESHOLD } = require('./defaults')
const systemIdleTime = require('@paulcbetts/system-idle-time')

const createLogger = () => ({
  log: (...args) => console.log(...args),
  info: (...args) => console.info(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
})

const getIdleTime = () => systemIdleTime.getIdleTime()
const isIdle = (threshold=IDLE_THRESHOLD) => getIdleTime() > threshold

module.exports = {
  createLogger,
  getIdleTime,
  isIdle,
}
