import React from 'react'
import {
  PieChart,
  Pie,
  // Sector,
  Cell
} from 'recharts'

const chromatism = require('chromatism')
const RADIAN = Math.PI / 180
const getColors = n => chromatism.adjacent(35, n, '#3e8ae0').hex

// const sampleData = [
//   {name: 'Group A', value: 400},
//   {name: 'Group B', value: 300},
//   {name: 'Group C', value: 300},
//   {name: 'Group D', value: 200}
// ]

class SummaryPieChart extends React.Component {
  static defaultProps = {
    data: [],
    size: 500,
  };

  onPieEnter() {}
  renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, data }) {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x  = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy  + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'}  dominantBaseline="central">
        {`${data.name} ${percent.toFixed(0)}%`}
      </text>
    )
  }

  render () {
    const { data, size } = this.props
    const colors = getColors(data.length)
    const radius = (size - 10) / 2
    return (
      <PieChart width={size} height={size} onMouseEnter={this.onPieEnter}>
        <Pie
          data={data}
          dataKey='percent'
          cx={radius}
          cy={radius}
          labelLine={false}
          label={this.renderCustomizedLabel.bind(this)}
          outerRadius={radius}
          fill="#8884d8"
        >
          {
            data.map((entry, i) => (
              <Cell key={'cell' + i} fill={colors[i % colors.length]} data={entry}/>
            ))
          }
        </Pie>
      </PieChart>
    )
  }
}

const getSummaryChartData = summary => summary.map(({ app, activeTab, percent }) => ({
  name: activeTab ? `browser: ${activeTab.title}` : app,
  percent
}))

export const chartSummary = ({ summary, ...rest }) =>
  <SummaryPieChart data={getSummaryChartData(summary)} {...rest} />
