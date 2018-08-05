const homedir = require('os').homedir()
const fs = require('fs')
const PROFILE_REGEX = /^\[(?:[^\s]*?\s)?(.*)\]$/
const getProfileName = line => line.match(PROFILE_REGEX)[1]
const parseConf = conf => ({
  profiles: conf.split('\n')
    .filter(s => s.startsWith('['))
    .map(getProfileName)
})

const getProfiles = () => {
  let conf
  try {
    conf = fs.readFileSync(`${homedir}/.aws/credentials`, { encoding: 'utf8' })
  } catch (err) {
    return ['default']
  }

  const { profiles } = parseConf(conf)
  return profiles.includes('default') ? profiles : ['default'].concat(profiles)
}

module.exports = getProfiles
