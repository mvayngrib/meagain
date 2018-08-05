const path = require('path')
const os = require('os')
const APP_NAME = 'MeAgain'
const confDir = `.${APP_NAME.toLowerCase()}`
const CONF_PATH = path.resolve(os.homedir(), confDir, 'conf.json')
module.exports = {
  APP_NAME,
  CONF_PATH,
}
