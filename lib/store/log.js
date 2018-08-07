const { fromPath } = require('../log')

exports.fromPath = logPath => exports.fromLog(fromPath(logPath))
exports.fromLog = log => ({
  put: log.append,
})
