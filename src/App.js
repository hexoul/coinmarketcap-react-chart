import React from 'react';
import { Layout, Table, Row, Col, DatePicker, TimePicker } from 'antd';
import { Line } from 'react-chartjs-2';

import { columns } from './tableColumns';
import { getURL, getSource, lineChartOptions, lineChartWithPriceVolume } from './util';

// Styles.
import './App.css';

var rawDataUpdatePeriod = 5 * 60 * 1000; // 5 min

class App extends React.Component {
  
  data = {
    targetSymbol: 'META',
    targetQuotes: ['USD', 'BTC', 'ETH'],
    targetMarkets: ['coinsuper', 'kucoin'],
    origin: [],
    lineChart: {},
  };

  state = {
    ready: false,
    marketData: [],
  }

  async loadRawData() {
    this.data.origin = [];
    let ret = await getSource();
    ret.split('\n').forEach(line => {
      if (! line) return;
      this.data.origin.push(JSON.parse(line));
    });
    if (this.data.origin.length === 0) return;
   
    // For charts
    var labels = {}, prices = {}, volumes = {};
    this.data.targetQuotes.forEach(v => { labels[v] = []; prices[v] = []; volumes[v] = [] });
    this.data.origin.filter(e => e.msg === 'GatherCryptoQuote' && e.symbol === this.data.targetSymbol).forEach(e => {
      this.data.targetQuotes.forEach(v => {
        labels[v].push(e.time);
        prices[v].push(e.quote[v].price);
        volumes[v].push(e.quote[v].volume_24h);
      });
    });
    var cmcData = { 'category': 'CMC' };
    this.data.targetQuotes.forEach(v => {
      this.data.lineChart[v] = lineChartWithPriceVolume(labels[v], prices[v], volumes[v]);
      cmcData[v + ':price'] = prices[v][prices[v].length -1];
      cmcData[v + ':volume'] = volumes[v][volumes[v].length -1];
    });
    this.state.marketData.push(cmcData);

    // For market data
    this.data.targetMarkets.forEach(market => {
      let data = this.data.origin
        .filter(e => e.msg === 'GatherExchangeMarketPairs' && e.symbol === this.data.targetSymbol && e.market === market)
        .pop().quote;

      let nItem = { 'category': market };
      this.data.targetQuotes.forEach(quote => {
        nItem[quote + ':price'] = data[quote].price;
        nItem[quote + ':volume'] = data[quote].volume_24h;
      });
      this.state.marketData.push(nItem);
    });

    this.setState({ ready: true });
  }

  constructor() {
    super();
    this.loadRawData();
    this.interval = setInterval(() => {
      this.loadRawData();
    }, rawDataUpdatePeriod);
  }

  render() {
    return (
      <Layout className='layout'>
        <Layout.Header>
          Header
        </Layout.Header>
        <Layout.Content style={{ padding: '5vh 5vw 0vh 5vw', backgroundColor: '#fff' }}>
          <Row>
            <Col span={4}><h3>Token Metric</h3></Col>
            <Col span={20}><DatePicker format='YYYY/MM/DD' onChange={() => {}}/> <TimePicker format='HH:mm:ss' /></Col>
          </Row>
          <br />
          {this.state.ready &&
            <Row>
              <Col span={10}>
                <Table
                  size='small'
                  pagination={false}
                  rowKey={record => record.symbol}
                  columns={columns.TokenMetric}
                  dataSource={[this.data.origin.filter(e => e.msg === 'GatherTokenMetric' && e.symbol === this.data.targetSymbol).pop()]}
                />
              </Col>
            </Row>
          }
          <br />
          <Row>
            <Col span={4}><h3>Market Data</h3></Col>
            <Col span={20}><DatePicker format='YYYY/MM/DD' onChange={() => {}}/> <TimePicker format='HH:mm:ss' /></Col>
          </Row>
          <br />
          {this.state.ready &&
            <Row>
              <Col span={22}>
                <Table
                  size='small'
                  pagination={false}
                  rowKey={record => record.category}
                  columns={columns.MarketData}
                  dataSource={this.state.marketData}
                />
              </Col>
            </Row>
          }
          <br /><h3>Chart</h3>
          {this.state.ready &&
            <Row>
              <Col span={11}>
                <Line
                  data={this.data.lineChart[this.data.targetQuotes[0]]}
                  options={lineChartOptions(this.data.targetSymbol + '/' + this.data.targetQuotes[0] + ' Price & Volume')}
                />
              </Col>
              <Col span={11} offset={1}>
                <Line
                  data={this.data.lineChart[this.data.targetQuotes[1]]}
                  options={lineChartOptions(this.data.targetSymbol + '/' + this.data.targetQuotes[1] + ' Price & Volume')}
                />
              </Col>
            </Row>
          }
        </Layout.Content>
        <Layout.Footer>
          <h3><a href={getURL()}>Raw data</a></h3>
          <center>coinmarketcap-react-chart ©2018 Created by hexoul</center>
        </Layout.Footer>
      </Layout>
    );
  }
}

export default App;