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

const { parseEnvVars, createLogger } = require('../utils')
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
    console.error(`expected conf file at: ${confPath}

please run: ${APP_NAME_LOWER} configure`)
    process.exit(1)
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

const track = (argv={}) => require('./track').track(withConf({
  ...argv,
  system,
  silent: defaults.silent
}))

const runDefaultCommand = track

const result = yargs
  // optional so that it can be passed via env var
  .command({
    command: 'start',
    aliases: ['track'],
    desc: 'start tracking your activity',
    handler: track,
    builder: {
      ...DEFAULT_COMMAND_BUILDER,
      'shell-ui': {
        default: !defaults.silent,
        boolean: true,
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
    aliases: ['configure'],
    desc: `configure ${APP_NAME_LOWER}`,
    handler: ({ confPath }) => require('./conf')(confPath),
    builder: DEFAULT_COMMAND_BUILDER,
  })
  .command({
    command: 'dump-local',
    handler: () => require('./dump-log').dumpLog()
  })
  .argv

if (!result._.length) {
  runDefaultCommand()
}
