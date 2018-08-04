
function run ([text]) {
  const app = Application.currentApplication()
  app.includeStandardAdditions = true
  app.displayNotification(text)
}
