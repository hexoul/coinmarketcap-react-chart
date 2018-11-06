import React from 'react';
import { Layout, Menu, Row, Col } from 'antd';
import { Line } from 'react-chartjs-2';

// Styles.
import './App.css';

// Raw data
import data from './report.log';

const options = {
  responsive: true,
  hoverMode: 'index',
  stacked: false,
  title: {
    display: true,
    text: 'BTC/USD Price & Volume'
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

class App extends React.Component {
  
  data = {
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
    
    var labels = [], prices = [], volumes = [];
    this.data.origin.filter(e => e.msg === 'GatherCryptoQuote' && e.symbol === 'BTC').forEach(e => {
      labels.push(e.time);
      prices.push(e.quote.USD.price);
      volumes.push(e.quote.USD.volume_24h);
    });
    this.data.lineChart = this.makeLineChartData(labels, prices, volumes);
    this.setState({ ready: true });
  }

  makeLineChartData(labels, prices, volumes) {
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
          <Menu
            theme='dark'
            mode='horizontal'
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
            // onClick={this.onMenuClick}
          >
            <Menu.Item key='1'>Tab 1</Menu.Item>
            <Menu.Item key='2'>Tab 2</Menu.Item>
            <Menu.Item key='3'>Tab 3</Menu.Item>
          </Menu>
        </Layout.Header>
        <Layout.Content style={{ padding: '5vh 5vw 0vh 5vw', backgroundColor: '#fff' }}>
          <Row>
            <Col span={11}>
              <Line
                data={this.data.lineChart}
                options={options}
              />
            </Col>
            <Col span={11} offset={1}>
              <Line
                data={this.data.lineChart}
                options={options}
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