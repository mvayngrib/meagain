const proc = require('child_process')

module.exports = cmd => proc.execSync(`command -v ${cmd}`).toString().trim()
