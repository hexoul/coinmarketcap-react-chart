import React from 'react';
import { Layout, Table, Row, Col, DatePicker, TimePicker } from 'antd';
import { Line } from 'react-chartjs-2';

import { constants } from './constants';
import { columns } from './tableColumns';
import { getURL, getSource, lineChartOptions, lineChartWithPriceVolume } from './util';

// Styles.
import './App.css';

class App extends React.Component {
  
  data = {
    origin: [],
    lineChart: {},
    searchDate: {},
    searchTime: {},
  };

  state = {
    ready: false,
    tokenMetric: [],
    marketData: [],
  }

  async loadRawData() {
    this.data.origin = [];
    this.data.lineChart = {};
    
    let ret = await getSource();
    ret.split('\n').forEach(line => {
      if (! line) return;
      this.data.origin.push(JSON.parse(line));
    });
    if (this.data.origin.length === 0) return;
   
    // For charts
    var labels = {}, prices = {}, volumes = {};
    constants.target.quotes.forEach(v => { labels[v] = []; prices[v] = []; volumes[v] = [] });
    this.data.origin.filter(e => e.msg === constants.gather.cryptoQuote && e.symbol === constants.target.symbol).forEach(e => {
      constants.target.quotes.forEach(v => {
        labels[v].push(e.time);
        prices[v].push(e.quote[v].price);
        volumes[v].push(e.quote[v].volume_24h);
      });
    });
    var cmcData = { 'category': 'CMC' };
    constants.target.quotes.forEach(v => {
      this.data.lineChart[v] = lineChartWithPriceVolume(labels[v], prices[v], volumes[v]);
      cmcData[v + ':price'] = prices[v][prices[v].length -1];
      cmcData[v + ':volume'] = volumes[v][volumes[v].length -1];
    });
    
    // For market data
    var marketData = [];
    marketData.push(cmcData);
    constants.target.markets.forEach(market => {
      let data = this.data.origin
        .filter(e => e.msg === constants.gather.marketPairs
                && e.symbol === constants.target.symbol
                && e.market === market);

      if (! data || data.length === 0) return;
      data = data.pop().quote;

      let nItem = { 'category': market };
      constants.target.quotes.forEach(quote => {
        nItem[quote + ':price'] = data[quote].price;
        nItem[quote + ':volume'] = data[quote].volume_24h;
      });
      marketData.push(nItem);
    });

    // For token metric
    var tokenMetric = this.data.origin.filter(e => e.msg === constants.gather.tokenMetric && e.symbol === constants.target.symbol);
    if (tokenMetric.length > 0) tokenMetric = [tokenMetric.pop()];

    this.setState({ ready: true, marketData: marketData, tokenMetric: tokenMetric });
  }

  constructor() {
    super();
    this.loadRawData();
    this.interval = setInterval(() => {
      this.loadRawData();
    }, constants.dataUpdatePeriod);
  }

  onSearchByTime = (target, isDate, dateStr) => {
    if (isDate) this.data.searchDate[target] = dateStr;
    else this.data.searchTime[target] = dateStr;

    if (! this.data.searchDate[target] || ! this.data.searchTime[target]) return;

    let searchTime = Date.parse(this.data.searchDate[target] + ' ' + this.data.searchTime[target]);
    switch (target) {
      case constants.key.tokenMetric:
        var tokenMetric = this.data.origin.filter(e => e.msg === constants.gather.tokenMetric && Date.parse(e.time) <= searchTime);
        if (tokenMetric.length > 0) tokenMetric = [tokenMetric.pop()];
        this.setState({ tokenMetric: tokenMetric });
        break;
      case constants.key.marketData:
        var marketData = [];
        var cmcData = { 'category': 'CMC' };
        var cmcOrigin = this.data.origin.filter(e => e.msg === constants.gather.cryptoQuote
                                                && e.symbol === constants.target.symbol
                                                && Date.parse(e.time) <= searchTime);
        if (! cmcOrigin || cmcOrigin.length === 0) {
          this.setState({ marketData: marketData });
          return;
        }
        cmcOrigin = cmcOrigin.pop();
        
        constants.target.quotes.forEach(v => {
          cmcData[v + ':price'] = cmcOrigin.quote[v].price;
          cmcData[v + ':volume'] = cmcOrigin.quote[v].volume_24h;
        });
        marketData.push(cmcData);
        constants.target.markets.forEach(market => {
          let data = this.data.origin
            .filter(e => e.msg === constants.gather.marketPairs
                    && e.symbol === constants.target.symbol
                    && e.market === market
                    && Date.parse(e.time) <= searchTime);
          if (! data || data.length === 0) return;
          data = data.pop().quote;
    
          let nItem = { 'category': market };
          constants.target.quotes.forEach(quote => {
            nItem[quote + ':price'] = data[quote].price;
            nItem[quote + ':volume'] = data[quote].volume_24h;
          });
          marketData.push(nItem);
          this.setState({ marketData: marketData });
        });
        break;
      default: break;
    }
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
            <Col span={20}>
              <DatePicker format='YYYY/MM/DD' onChange={(d, ds) => this.onSearchByTime(constants.key.tokenMetric, true, ds)} />
              <TimePicker format='HH:mm:ss' onChange={(t, ts) => this.onSearchByTime(constants.key.tokenMetric, false, ts)} />
            </Col>
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
                  dataSource={this.state.tokenMetric}
                />
              </Col>
            </Row>
          }
          <br />
          <Row>
            <Col span={4}><h3>Market Data</h3></Col>
            <Col span={20}>
              <DatePicker format='YYYY/MM/DD' onChange={(d, ds) => this.onSearchByTime(constants.key.marketData, true, ds)} />
              <TimePicker format='HH:mm:ss' onChange={(t, ts) => this.onSearchByTime(constants.key.marketData, false, ts)} />
            </Col>
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
                  data={this.data.lineChart[constants.target.quotes[0]]}
                  options={lineChartOptions(constants.target.symbol + '/' + constants.target.quotes[0] + ' Price & Volume')}
                />
              </Col>
              <Col span={11} offset={1}>
                <Line
                  data={this.data.lineChart[constants.target.quotes[2]]}
                  options={lineChartOptions(constants.target.symbol + '/' + constants.target.quotes[2] + ' Price & Volume')}
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