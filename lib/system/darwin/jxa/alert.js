/* global Application */

// eslint-disable-next-line no-unused-vars
function run ([text, informationalText]) {
  const app = Application.currentApplication()
  const opts = {}
  if (informationalText) opts.message = informationalText
  app.displayAlert(text, opts)
}
