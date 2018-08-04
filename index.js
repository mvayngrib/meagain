const log = (...args) => console.log(...args)
const {
  getForegroundApp,
  getCurrentItunesTrack,
  getTabsForAllBrowsers,
} = require('./jxa')

const run = async () => {
  log(await getForegroundApp())
  log(await getCurrentItunesTrack())
  log(await getTabsForAllBrowsers())
}

setInterval(() => {
  run().catch(console.error)
}, 1000)

// const { EventEmiter } = require('events')
// const sys = require('systeminformation')
// const isHttpPort = port => {
//   port = Number(port)
//   return port === 80 || port === 443
// }

// const prettify = obj => JSON.stringify(obj, null, 2)
// const log = (...args) => console.log(...args)
// const logPretty = (...args) => console.log(prettify(...args))

// setInterval(async () => {
//   // const cxns = await sys.networkConnections()
//   // const http = cxns.filter(({ port }) => isHttpPort(port))
//   // logPretty(http)

//   // const stats = await sys.networkStats('en0')
//   // logPretty(stats)

//   // const cxns = await sys.networkConnections()
//   // const http = cxns.filter(({ peerport }) => isHttpPort(peerport))
//   // logPretty(http)

//   const processes = await sys.processes()
//   logPretty(processes)
// }, 1000)
