const fs = require('fs')
const os = require('os')
const path = require('path')
const yargs = require('yargs')
const withDefaults = require('lodash/defaults')
const { APP_NAME } = require('../constants')
const system = require('../system')[os.platform()]
if (!system) {
  throw new Error('only OSX is currently supported')
}

const { parseEnvVars } = require('../utils')
const defaults = withDefaults({
  ...parseEnvVars(process.env),
  ...require('../defaults'),
})

const withResolvedConf = ({ confPath=defaults.confPath, ...rest }) => {
  confPath = path.resolve(process.cwd(), confPath)
  if (!fs.existsSync(confPath)) {
    confPath = path.resolve(__dirname, `../${confPath}`)
  }

  if (!fs.existsSync(confPath)) {
    throw new Error(`expected conf file at: ${confPath}`)
  }

  let conf
  try {
    conf = require(confPath)
  } catch (err) {
    throw new Error(`invalid conf at path: ${confPath}`)
  }

  return {
    confPath,
    conf,
    ...rest,
  }
}

const track = (argv={}) => require('./track')(withResolvedConf({
  ...argv,
  system,
  silent: defaults.silent
}))

const result = yargs
  // optional so that it can be passed via env var
  .command({
    command: 'track [confPath]',
    desc: 'start tracking',
    handler: track
  })
  .command({
    command: 'service <command> [confPath]',
    desc: `install/uninstall/start/stop ${APP_NAME} background service:

trackme service install ./path/to/conf.json
trackme service uninstall
trackme service start
trackme service stop

you might need sudo
`,
    handler: argv => require('./service')(withResolvedConf(argv)),
  })
  .argv

if (!result._.length) {
  track()
}
