const util = require('util')
const changes = require('changes-feed')

module.exports = leveldb => {
  const feed = changes(leveldb)
  const put = util.promisify(feed.append)
  return {
    put,
    // getEvent,
  }
}
