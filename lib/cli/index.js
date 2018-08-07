const fs = require('fs')
const path = require('path')
const os = require('os')
const yargs = require('yargs')
const withDefaults = require('lodash/defaults')
const { APP_NAME, CONF_PATH } = require('../constants')
const APP_NAME_LOWER = APP_NAME.toLowerCase()
const system = require('../system')[os.platform()]
if (!system) {
  throw new Error('only OSX is currently supported')
}

const { parseEnvVars } = require('../utils')
const defaults = withDefaults({
  ...parseEnvVars(process.env),
  ...require('../defaults'),
})

const DEFAULT_COMMAND_BUILDER = {
  'conf-path': {
    default: CONF_PATH
  },
}

const withConf = (argv) => {
  // allow override
  const confPath = argv.confPath ? path.resolve(process.cwd(), argv.confPath) : CONF_PATH
  if (!fs.existsSync(confPath)) {
    throw new Error(`expected conf file at: ${confPath}

please run: ${APP_NAME_LOWER} conf`)
  }

  let conf
  try {
    conf = require(confPath)
  } catch (err) {
    throw new Error(`invalid conf at path: ${confPath}`)
  }

  return {
    ...argv,
    conf,
  }
}

const track = (argv={}) => require('./track')(withConf({
  ...argv,
  system,
  silent: defaults.silent
}))

const runDefaultCommand = track

const result = yargs
  // optional so that it can be passed via env var
  .command({
    command: 'track',
    desc: 'start tracking your activity',
    handler: track,
    builder: {
      ...DEFAULT_COMMAND_BUILDER,
      'shell-ui': {
        default: false
      }
    }
  })
  .command({
    command: 'service <command>',
    desc: `install/uninstall/start/stop ${APP_NAME} background service:

${APP_NAME_LOWER} service install
${APP_NAME_LOWER} service uninstall
${APP_NAME_LOWER} service start
${APP_NAME_LOWER} service stop

you might need sudo`,
    handler: argv => require('./service')(withConf(argv)),
    builder: DEFAULT_COMMAND_BUILDER,
  })
  .command({
    command: 'conf',
    desc: 'configure meagain',
    handler: ({ confPath=CONF_PATH }) => require('./conf')(confPath),
    builder: DEFAULT_COMMAND_BUILDER,
  })
  .argv

if (!result._.length) {
  runDefaultCommand()
}