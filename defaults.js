const { APP_NAME } = require('./constants')
const monitor = {
  idleThreshold: 12000,
  interval: 1000,
}

const aws = {
  profile: 'default',
}

const s3Prefix = APP_NAME.toLowerCase()

module.exports = {
  monitor,
  aws,
  s3Prefix,
}
