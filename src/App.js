import React from 'react';
import { Layout, Table, Row, Col, DatePicker, TimePicker } from 'antd';
import { Line } from 'react-chartjs-2';
import { CSVLink } from 'react-csv';

import { constants, columns, csvHeaders } from './constants';
import { getURL, getSource, lineChartOptions, lineChartWithPriceVolume, getMarketDataCSV } from './util';

// Styles.
import './App.css';

class App extends React.Component {
  
  data = {
    origin: [],
    lineChart: {},
    csvMarketData: {},
    searchDate: {},
    searchTime: {},
  };

  state = {
    ready: false,
    tokenMetric: [],
    marketData: [],
    ohlcvData: [],
  };

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
    
    // For CSV
    this.data.csvMarketData['CMC'] = this.data.origin.filter(e => e.msg === constants.gather.cryptoQuote && e.symbol === constants.target.symbol).map(e => getMarketDataCSV('CMC', e));
    constants.target.markets.forEach(market => {
      this.data.csvMarketData[market] = this.data.origin
        .filter(e => e.msg === constants.gather.marketPairs
                && e.symbol === constants.target.symbol
                && e.market === market)
        .map(e => getMarketDataCSV(market, e));
    });

    // For market data table
    var marketData = [];
    Object.values(this.data.csvMarketData).forEach(e => {
      if (e.length > 0) marketData.push(e[e.length-1]);
    });

    // For token metric table
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
    // Set date and time to search
    if (isDate) this.data.searchDate[target] = dateStr;
    else this.data.searchTime[target] = dateStr;

    if (! this.data.searchDate[target] || ! this.data.searchTime[target]) return;

    // Search by given time
    let searchTime = Date.parse(this.data.searchDate[target] + ' ' + this.data.searchTime[target]);
    switch (target) {
      // Filter and pick last one that is closest data point
      case constants.key.tokenMetric:
        var tokenMetric = this.data.origin.filter(e => e.msg === constants.gather.tokenMetric && Date.parse(e.time) <= searchTime);
        if (tokenMetric.length > 0) tokenMetric = [tokenMetric.pop()];
        this.setState({ tokenMetric: tokenMetric });
        break;
      case constants.key.marketData:
        // Market data is composed of both CMC and market
        var marketData = [];
        Object.values(this.data.csvMarketData).forEach(e => {
          var found = e.filter(v => Date.parse(v.time) <= searchTime);
          if (found.length > 0) marketData.push(found[found.length-1]);
        });
        this.setState({ marketData: marketData });
        break;
      default: break;
    }
  }

  getTokenMetricRender() {
    return <div>
      <Row>
        <Col span={4}><h3>Token Metric</h3></Col>
        <Col span={18}>
          <DatePicker format='YYYY/MM/DD' onChange={(d, ds) => this.onSearchByTime(constants.key.tokenMetric, true, ds)} />
          {' '}<TimePicker format='HH:mm:ss' onChange={(t, ts) => this.onSearchByTime(constants.key.tokenMetric, false, ts)} />
          {this.state.ready &&
            <CSVLink
              filename='token-metric.csv'
              headers={csvHeaders.tokenMetric}
              data={this.data.origin.filter(e => e.msg === constants.gather.tokenMetric && e.symbol === constants.target.symbol)}
            > Download</CSVLink>
          }
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
    </div>
  }

  getMarketDataRender() {
    return <div>
      <Row>
        <Col span={4}><h3>Market Data</h3></Col>
        <Col span={20}>
          <DatePicker format='YYYY/MM/DD' onChange={(d, ds) => this.onSearchByTime(constants.key.marketData, true, ds)} />
          {' '}<TimePicker format='HH:mm:ss' onChange={(t, ts) => this.onSearchByTime(constants.key.marketData, false, ts)} />
          {this.state.ready &&
            Object.keys(this.data.csvMarketData).map(market => {
              return <CSVLink
                key={market}
                filename={'market-data-' + market + '.csv'}
                headers={csvHeaders.marketData}
                data={this.data.csvMarketData[market]}
              > {market} </CSVLink>
            })
          }
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
    </div>
  }

  getOhlcvRender() {
    return <div>
      <Row>
        <Col span={4}><h3>OHLCV</h3></Col>
        <Col span={20}>
          {this.state.ready &&
            <div>Ready..</div>
          }
        </Col>
      </Row>
      <br />
      {this.state.ready &&
        <Row>
          <Col span={22}>
            <Table
              size='small'
              pagination={false}
              rowKey={record => record.date}
              columns={columns.Ohlcv}
              dataSource={this.state.ohlcvData}
            />
          </Col>
        </Row>
      }
    </div>
  }

  getChartRender() {
    return <div>
      <h3>Chart</h3>
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
    </div>
  }

  render() {
    return (
      <Layout className='layout'>
        <Layout.Header>
          Header
        </Layout.Header>
        <Layout.Content style={{ padding: '5vh 5vw 0vh 5vw', backgroundColor: '#fff' }}>
          {this.getTokenMetricRender()}
          <br />
          {this.getMarketDataRender()}
          <br />
          {this.getOhlcvRender()}
          <br />
          {this.getChartRender()}
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