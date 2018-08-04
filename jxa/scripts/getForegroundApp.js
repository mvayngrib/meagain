/* global Application */

const getForegroundApp = () => {
  const name = Application('System Events').applicationProcesses.where({ frontmost: true }).name()[0]
  const app = Application(name)
  app.includeStandardAdditions = true
  return { name, app }
}

const browsersA = ['Google Chrome','Google Chrome Canary','Chromium','Opera','Vivaldi']
const browsersB = ['Safari','Safari Technology Preview','Webkit']
const browsers = browsersA.concat(browsersB)
const getActiveTab = (app, browser) => {
  if (browsersA.includes(browser)) {
    if (app.windows.length) {
      return app.windows[0].activeTab
    }
  } else if (browsersB.includes(browser)) {
    return app.documents[0]
  }
}

const getAppInfo = ({ app, name }) => {
  const info = { app: name }
  if (browsers.includes(name)) {
    info.type = 'browser'
    const activeTab = getActiveTab(app, name)
    if (activeTab) {
      info.activeTab = {
        title: activeTab.name(),
        url: activeTab.url(),
      }
    }
  } else if (name === 'iTunes') {
    const { currentTrack } = app
    info.currentTrack = {
      title: currentTrack.name(),
      artist: currentTrack.artist(),
      album: currentTrack.album(),
      duration: currentTrack.duration(),
      position: app.playerPosition(),
    }
  }

  return info
}

JSON.stringify(getAppInfo(getForegroundApp()))
