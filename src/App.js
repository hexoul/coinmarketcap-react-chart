import React from 'react';
import { Layout, Row, Col } from 'antd';
import { Line } from 'react-chartjs-2';

// Styles.
import './App.css';

// Raw data
import data from './report.log';

const options = (title) => {
  return {
    responsive: true,
    hoverMode: 'index',
    stacked: false,
    title: {
      display: true,
      text: title
    },
    scales: {
      yAxes: [{
        type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
        display: true,
        position: 'left',
        id: 'y-axis-1',
      }, {
        type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
        display: true,
        position: 'right',
        id: 'y-axis-2',
        // grid line settings
        gridLines: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
      }],
    }
  }
}

class App extends React.Component {
  
  data = {
    targetSymbol: 'META',
    targetQuotes: ['USD', 'BTC', 'ETH'],
    origin: [],
    lineChart: {},
  };

  state = {
    ready: false,
  }

  async loadRawData() {
    let resp = await fetch(data);
    let ret = await resp.text();
    ret.split('\n').forEach(line => {
      if (! line) return;
      this.data.origin.push(JSON.parse(line));
    });
    
    var labels = {}, prices = {}, volumes = {};
    this.data.targetQuotes.forEach(v => { labels[v] = []; prices[v] = []; volumes[v] = [] });
    this.data.origin.filter(e => e.msg === 'GatherCryptoQuote' && e.symbol === this.data.targetSymbol).forEach(e => {
      this.data.targetQuotes.forEach(v => {
        labels[v].push(e.time);
        prices[v].push(e.quote[v].price);
        volumes[v].push(e.quote[v].volume_24h);
      });
    });
    this.data.targetQuotes.forEach(v => { this.data.lineChart[v] = this.makeLineChartWithPriceVolume(labels[v], prices[v], volumes[v]); });
    this.setState({ ready: true });
  }

  makeLineChartWithPriceVolume(labels, prices, volumes) {
    return {
      labels: labels,
      datasets: [
        {
          label: 'Prices',
          borderColor: 'rgba(246,44,44,1)',
          backgroundColor: 'rgba(246,44,44,1)',
          fill: false,
          data: prices,
          yAxisID: 'y-axis-1',
        },
        {
          label: 'Volumes',
          borderColor: 'rgba(151,187,205,1)',
          backgroundColor: 'rgba(151,187,205,1)',
          fill: false,
          data: volumes,
          yAxisID: 'y-axis-2',
        },
      ]
    };
  }

  constructor() {
    super();
    this.loadRawData();
  }

  render() {
    return (
      <Layout className='layout'>
        <Layout.Header>
          Header
        </Layout.Header>
        <Layout.Content style={{ padding: '5vh 5vw 0vh 5vw', backgroundColor: '#fff' }}>
          <Row>
            <Col span={11}>
              <Line
                data={this.data.lineChart[this.data.targetQuotes[0]]}
                options={options(this.data.targetSymbol + '/' + this.data.targetQuotes[0] + ' Price & Volume')}
              />
            </Col>
            <Col span={11} offset={1}>
              <Line
                data={this.data.lineChart[this.data.targetQuotes[1]]}
                options={options(this.data.targetSymbol + '/' + this.data.targetQuotes[1] + ' Price & Volume')}
              />
            </Col>
          </Row>
        </Layout.Content>
        <Layout.Footer>
          <h3><a href={data}>Raw data</a></h3>
          <center>coinmarketcap-react-chart ©2018 Created by hexoul</center>
        </Layout.Footer>
      </Layout>
    );
  }
}

export default App;