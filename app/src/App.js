import React, { Component } from 'react';
import './App.css';
import { chartSummary } from './charts'
// import { SUMMARY_PATH } from '../constants'

const getSummary = () => {
  return [
    {
      app: 'A',
      percent: 20,
      value: 200
    },
    {
      app: 'B',
      percent: 30,
    },
    {
      app: 'C',
      percent: 30,
    },
    {
      app: 'D',
      percent: 20,
    },
    {
      app: 'E',
      percent: 20,
    },
    {
      app: 'F',
      percent: 20,
    },
    {
      app: 'G',
      percent: 20,
    }
  ]
  // const summary = require(SUMMARY_PATH)
  // delete require.cache[SUMMARY_PATH]
  // return summary
}

// <img src={logo} className="App-logo" alt="logo" />

class App extends Component {
  renderHelper({ chart, error }) {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">it's me again</h1>
        </header>
        <p className="App-chart">{chart}</p>
        <p className="App-error">{error ? error.message : ''}</p>
      </div>
    )
  }
  render() {
    try {
      const summary = getSummary()
      const chart = chartSummary({ summary, size: 400 })
      return this.renderHelper({ chart })
    } catch (error) {
      return this.renderHelper({ error })
    }
  }
}

export default App
