/* global Application */

const getForegroundAppName = () => Application('System Events')
  .applicationProcesses
  .where({ frontmost: true })
  .name()[0]

const getForegroundApp = () => {
  const name = getForegroundAppName()
  const app = Application(name)
  app.includeStandardAdditions = true
  return { app, name }
}

const browsersA = ['Google Chrome','Google Chrome Canary','Chromium','Opera','Vivaldi']
const browsersB = ['Safari','Safari Technology Preview','Webkit']
const browsersC = ['firefox']
const browsers = browsersA.concat(browsersB).concat(browsersC)
const getActiveTab = (app, browser) => {
  if (browsersA.includes(browser)) {
    if (app.windows.length) {
      return app.windows[0].activeTab
    }
  } else if (browsersB.includes(browser)) {
    return app.documents[0]
  } else if (browsersC.includes(browser)) {
    const w = app.windows[0]
    return {
      name: () => w && w.name(),
      url: () => {
        try {
          return w.url()
        } catch (err) {
          // eslint-disable-line no-empty-blocks
        }
      },
    }
  }
}

const getAppInfo = ({ app, name }) => {
  const info = { app: name, }
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

// eslint-disable-next-line no-unused-vars
function run () {
  return JSON.stringify(getAppInfo(getForegroundApp()))
}
