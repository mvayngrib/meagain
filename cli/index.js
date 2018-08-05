const fs = require('fs')
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

const withConf = (argv) => {
  if (!fs.existsSync(CONF_PATH)) {
    throw new Error(`expected conf file at: ${CONF_PATH}

please run: ${APP_NAME_LOWER} conf`)
  }

  let conf
  try {
    conf = require(CONF_PATH)
  } catch (err) {
    throw new Error(`invalid conf at path: ${CONF_PATH}`)
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

const result = yargs
  // optional so that it can be passed via env var
  .command({
    command: ['start', 'track'],
    desc: 'start tracking your activity',
    handler: track
  })
  .command({
    command: 'service <command>',
    desc: `install/uninstall/start/stop ${APP_NAME} background service:

${APP_NAME_LOWER} service install
${APP_NAME_LOWER} service uninstall
${APP_NAME_LOWER} service start
${APP_NAME_LOWER} service stop

you might need sudo
`,
    handler: argv => require('./service')(withConf(argv)),
  })
  .command({
    command: 'conf',
    desc: 'configure meagain',
    handler: () => require('./conf')()
  })
  .argv

if (!result._.length) {
  track()
}
