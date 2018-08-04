const getStdout = require('execa').stdout

module.exports = async (scriptPath, arg='') => {
  const result = await getStdout('osascript', [
    '-l',
    'JavaScript',
    require.resolve(scriptPath),
    arg
  ])

  return JSON.parse(result)
}
