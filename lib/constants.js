const path = require('path')
const os = require('os')
const APP_NAME = 'MeAgain'
const CONF_DIR_NAME = `.${APP_NAME.toLowerCase()}`
const CONF_DIR = path.resolve(os.homedir(), CONF_DIR_NAME)
const CONF_PATH = path.resolve(CONF_DIR, 'conf.json')
const SUMMARY_PATH = path.resolve(CONF_DIR, 'summary.json')
const second = 1000
const minute = 60 * second
const hour = 60 * minute
const day = 24 * hour
const month = 30 * day
const year = 365 * day
const unitToMillis = {
  year,
  month,
  day,
  hour,
  halfHour: 30 * minute,
  quarterHour: 15 * minute,
  tenMinutes: 10 * minute,
  fiveMinutes: 5 * minute,
  minute,
  second,
}

module.exports = {
  APP_NAME,
  CONF_DIR,
  CONF_PATH,
  SUMMARY_PATH,
  unitToMillis,
}
