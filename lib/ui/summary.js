
const ReactDOM = require('react-dom')
const { chartSummary } = require('./chart')

const DEFAULT_SIZE = 800
const summaryPage = ({ summary }) =>
  htmlTemplate(ReactDOM.renderToString(chartSummary({ summary, size: DEFAULT_SIZE })))

const htmlTemplate = components => `
  <!DOCTYPE html>
  <html>
    <head>
        <meta charset="utf-8">
        <title>React SSR</title>
    </head>

    <body>
        <div id="app">${ components }</div>
        <script src="./app.bundle.js"></script>
    </body>
  </html>
`

module.exports = {
  summaryPage
}
