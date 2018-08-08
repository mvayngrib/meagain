const pump = require('pump')
const through = require('through2')
const log = require('./track').getLog()

const dumpLog = () => pump(
  log.createReadStream(),
  through.obj((obj, enc, cb) => cb(null, JSON.stringify(obj, null, 2) + '\n')),
  process.stdout,
  err => {
    if (err) throw err
  }
)

module.exports = {
  dumpLog
}
