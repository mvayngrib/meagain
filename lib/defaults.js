const { APP_NAME } = require('./constants')
const monitor = {
  idleThreshold: 12000,
  interval: 1000,
}

const aws = {
  profile: 'default',
}

const s3Prefix = APP_NAME.toLowerCase()
const shellUi = 'gui'

module.exports = {
  monitor,
  aws,
  s3Prefix,
  shellUi,
}
