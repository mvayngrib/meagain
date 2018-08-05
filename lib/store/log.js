const util = require('util')
const level = require('level')
const changes = require('changes-feed')

module.exports = logPath => {
  const feed = changes(level(logPath))
  const put = util.promisify(feed.append)
  return {
    put,
    // getEvent,
  }
}
