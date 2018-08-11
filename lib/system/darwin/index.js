const path = require('path')
const fs = require('fs')
const systemIdleTime = require('@paulcbetts/system-idle-time')
const exec = require('./exec')
// const browserTabScripts = require('./browser-tabs')
const getIdleTime = () => systemIdleTime.getIdleTime()
const isIdle = threshold => getIdleTime() > threshold
const scripts = {
  // ...browserTabScripts,
  isIdle,
}

const scriptsDir = path.resolve(__dirname, 'jxa')

fs.readdirSync(scriptsDir).forEach(name => {
  const scriptPath = path.resolve(scriptsDir, name)
  const moduleName = name.slice(0, -3) // slice off .js
  scripts[moduleName] = arg => exec(scriptPath, arg)
})

module.exports = scripts
