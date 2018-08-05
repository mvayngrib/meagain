/* global Application */

// eslint-disable-next-line no-unused-vars
function run ([text]) {
  const app = Application.currentApplication()
  app.includeStandardAdditions = true
  app.displayNotification(text)
}
