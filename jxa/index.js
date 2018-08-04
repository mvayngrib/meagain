const path = require('path')
const fs = require('fs')
const exec = require('./exec')
const browserTabScripts = require('./browser-tabs')
const scripts = {
  ...browserTabScripts,
}

const scriptsDir = path.resolve(__dirname, 'scripts')

fs.readdirSync(scriptsDir).forEach(name => {
  const scriptPath = path.resolve(scriptsDir, name)
  const moduleName = name.slice(0, -3) // slice off .js
  scripts[moduleName] = arg => exec(scriptPath, arg)
})

module.exports = scripts
