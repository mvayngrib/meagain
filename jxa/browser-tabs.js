const _getBrowserTabs = require('get-browser-tabs')
const logger = require('../utils').createLogger()
const DEFAULT_BROWSER = 'chrome'
const ALL_BROWSERS = [
  'chrome',
  'canary',
  'opera',
  'firefox',
  'safari',
  'safari-tech-preview',
]

const flatten = arr => [].concat.apply([], arr)
const getTabsForAllBrowsers = () => getTabsForBrowsers(ALL_BROWSERS)
const getTabsForBrowsers = async (browsers) => {
  try {
    const tabs = await Promise.all(browsers.map(getBrowserTabs))
    return flatten(tabs)
  } catch (err) {
    logger.error(err.stack)
    return []
  }
}

const getBrowserTabs = async (browser=DEFAULT_BROWSER) => {
  try {
    const tabs = await _getBrowserTabs({ app: browser })
    return tabs.map(tab => ({
      ...tab,
      browser,
    }))
  } catch (err) {
    return []
  }
}

module.exports = {
  getTabsForAllBrowsers,
  getBrowserTabs,
  getTabsForBrowsers,
}
