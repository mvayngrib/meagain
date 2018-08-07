const util = require('util')
const level = require('level')
const changes = require('changes-feed')
const pump = require('pump')
const through = require('through2')
const FEED_OPTS = { start: 0 }
const maybeParse = val => {
  if (typeof val === 'string' || Buffer.isBuffer(val)) {
    return JSON.parse(val)
  }

  return val
}

const wrap = feed => {
  const _append = util.promisify(feed.append)
  const append = data => _append(JSON.stringify(data))
  const createReadStream = opts => {
    return pump(
      feed.createReadStream(opts),
      through.obj((data, enc, cb) => {
        cb(null, {
          ...data,
          value: maybeParse(data.value)
        })
      })
    )
  }

  const get = util.promisify(feed.get)
  const del = util.promisify(feed.del)
  const onready = util.promisify(feed.onready)
  return {
    get start() {
      return feed.start
    },
    append,
    get,
    del,
    createReadStream,
    onready,
  }
}

exports.DB_OPTS = {
  keyEncoding: 'utf8',
  valueEncoding: 'json',
}

exports.fromPath = dbPath => exports.fromDB(level(dbPath, exports.DB_OPTS))
exports.fromDB = db => wrap(changes(db, FEED_OPTS))
