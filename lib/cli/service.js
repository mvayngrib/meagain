const { Service } = require('node-mac')
const getCommandPath = require('./get-command-path')
const binaryName = require('../../package.json').name
const appBinaryPath = getCommandPath(binaryName)
const { APP_NAME, UI_TYPE } = require('../constants')
const { getHomedir } = require('../utils')
const logger = console

module.exports = ({ command }) => {
  const execCommand = command => {
    if (command === 'install') {
      svc.install()
    } else if (command === 'uninstall') {
      svc.uninstall()
    } else if (command === 'start') {
      svc.start()
    } else if (command === 'stop') {
      svc.stop()
    } else {
      throw new Error(`unknown command "${command}", expected one of: install, uninstall, start, stop`)
    }
  }

  const failAndExit = message => {
    logger.error(message)
    process.exit(1)
  }

  const handleError = err => {
    if (err.code === 'EACCES') {
      failAndExit('access denied!')
    }

    if (command === 'uninstall' && err.code === 'ENOENT') {
      failAndExit('file not found, seems the service is not installed')
    }

    throw err
  }

  const svc = new Service({
    name: APP_NAME,
    description: 'track usage Mac activity for personal development',
    script: appBinaryPath,
    runAsUserAgent: true,
    env: [
      {
        name: 'HOME',
        value: getHomedir(),
      },
      {
        name: 'MEAGAIN_UI',
        value: UI_TYPE.log,
      }
    ]
  })

  svc.on('install', () => {
    logger.debug('service installed')
    svc.start()
  })

  svc.on('alreadyinstalled', () => {
    logger.debug('service already installed')
    svc.start()
  })

  svc.on('uninstall', () => logger.debug('service uninstalled'))
  svc.on('start', () => logger.debug('service started'))
  svc.on('stop', () => logger.debug('service stopped'))
  svc.on('error', handleError)

  try {
    execCommand(command)
  } catch (err) {
    handleError(err)
  }
}
