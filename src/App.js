import React from 'react';
import { Layout, Table, Row, Col, DatePicker, TimePicker } from 'antd';
import { Line } from 'react-chartjs-2';
import { CSVLink } from 'react-csv';

import { constants, columns, csvHeaders } from './constants';
import { getURL, getSource, lineChartOptions, lineChartWithPriceVolume, getMarketDataCSV, getOhlcvCSV } from './util';

// Styles.
import './App.css';

class App extends React.Component {
  
  data = {
    origin: [],
    lineChart: {},
    csvMarketData: {},
    csvOhlcvData: {},
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
    
    // Get source from remote repo
    let ret = await getSource();
    ret.split('\n').forEach(line => {
      if (! line) return;
      this.data.origin.push(JSON.parse(line));
    });
    if (this.data.origin.length === 0) return;
   
    //--------------------------------- Chart ---------------------------------//
    // Construct raw data for charts
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
    
    // After constructing charts, reverse array to descending order for CSV and table
    this.data.origin.reverse();

    //--------------------------------- CSV ---------------------------------//
    // Construct raw data for CSV of market data
    this.data.csvMarketData['CMC'] = this.data.origin
      .filter(e => e.msg === constants.gather.cryptoQuote && e.symbol === constants.target.symbol)
      .map(e => { e.market = 'CMC'; return getMarketDataCSV(e); });
    constants.target.markets.forEach(market => {
      this.data.csvMarketData[market] = this.data.origin
        .filter(e => e.msg === constants.gather.marketPairs
                && e.symbol === constants.target.symbol
                && e.market === market)
        .map(e => getMarketDataCSV(e));
    });

    // Construct raw data for CSV of ohlcv
    constants.target.quotes.forEach(quote => {
      this.data.csvOhlcvData[quote] = this.data.origin
        .filter(e => e.msg === constants.gather.ohlcv
                && e.symbol === constants.target.symbol
                && e.convert === quote)
        .map(e => getOhlcvCSV(e, this.data.csvMarketData));
    });

    //--------------------------------- Table ---------------------------------//
    // Construct raw data for token metric table
    var tokenMetric = this.data.origin.filter(e => e.msg === constants.gather.tokenMetric && e.symbol === constants.target.symbol);
    if (tokenMetric.length > 0) tokenMetric = tokenMetric.slice(0, 1);

    // Construct raw data for market data table
    var marketData = [];
    Object.values(this.data.csvMarketData).forEach(e => {
      if (e.length > 0) marketData.push(e[0]);
    });
    
    // Construct raw data for ohlcv table
    var ohlcvData = [];
    Object.values(this.data.csvOhlcvData).forEach(e => {
      if (e.length > 0) ohlcvData.push(e[0]);
    });

    this.setState({ ready: true, tokenMetric: tokenMetric, marketData: marketData, ohlcvData: ohlcvData });
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

    if (target === constants.key.ohlcvData && this.data.searchDate[target]);
    else if (! this.data.searchDate[target] || ! this.data.searchTime[target]) return;

    // Search by given time
    let searchTime = Date.parse(this.data.searchDate[target] + ' ' + this.data.searchTime[target]);
    switch (target) {
      // Filter and pick last one that is closest data point
      case constants.key.tokenMetric:
        var tokenMetric = this.data.origin.filter(e => e.msg === constants.gather.tokenMetric && Date.parse(e.time) <= searchTime);
        if (tokenMetric.length > 0) tokenMetric = [tokenMetric[0]];
        this.setState({ tokenMetric: tokenMetric });
        break;
      case constants.key.marketData:
        // Market data is composed of both CMC and market
        var marketData = [];
        Object.values(this.data.csvMarketData).forEach(e => {
          var found = e.filter(v => Date.parse(v.time) <= searchTime);
          if (found.length > 0) marketData.push(found[0]);
        });
        this.setState({ marketData: marketData });
        break;
      case constants.key.ohlcvData:
        searchTime = Date.parse(this.data.searchDate[target])
        var ohlcvData = [];
        Object.values(this.data.csvOhlcvData).forEach(e => {
          var found = e.filter(v => Date.parse(v.date) <= searchTime);
          if (found.length > 0) ohlcvData.push(found[0]);
        });
        this.setState({ ohlcvData: ohlcvData });
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
          <DatePicker format='YYYY/MM/DD' onChange={(d, ds) => this.onSearchByTime(constants.key.ohlcvData, true, ds)} />{' '}
          {this.state.ready &&
            Object.keys(this.data.csvOhlcvData).map(quote => {
              return <CSVLink
                key={quote}
                filename={'ohlcv-' + quote + '.csv'}
                headers={csvHeaders.ohlcvData}
                data={this.data.csvOhlcvData[quote]}
              > {quote} </CSVLink>
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
              rowKey={record => record.unit}
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
          <Col span={22}>
            <Line
              data={this.data.lineChart[constants.target.quotes[0]]}
              options={lineChartOptions(constants.target.symbol + '/' + constants.target.quotes[0] + ' Price & Volume')}
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