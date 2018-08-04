const getAppInfo = ({ app, name }) => {
  const info = { name }
  if (['Google Chrome','Google Chrome Canary','Chromium','Opera','Vivaldi'].includes(name)) {
    info.type = 'browser'
    info.activeTab = {
      title: app.windows[0].activeTab.name(),
      url: app.windows[0].activeTab.url(),
    }

  } else if (['Safari','Safari Technology Preview','Webkit'].includes(name)) {
    info.type = 'browser'
    info.activeTab = {
      title: app.documents[0].name(),
      url: app.documents[0].url(),
    }
  }

  return info
}

const getForegroundApp = () => {
  const name = Application('System Events').applicationProcesses.where({ frontmost: true }).name()[0]
  const app = Application(name)
  return { name, app }
}

JSON.stringify(getAppInfo(getForegroundApp()))
