import React from 'react';
import ReactLoading from 'react-loading';
import { Layout, Table, Row, Col, DatePicker, TimePicker } from 'antd';
import { Line, Bar } from 'react-chartjs-2';
import { CSVLink } from 'react-csv';

import { constants, columns, csvHeaders } from './constants';
import {
  getURL, getSource,
  lineChartOptions, lineChartWithPriceVolume, lineChartWithCloseVolume,
  barChartOptions, barChartWithVolumes,
  getMarketDataCSV, getOhlcvCSV } from './util';

// Styles.
import './App.css';
import { CloudDownload } from '@material-ui/icons';

const keyMerged = 'Merged';

class App extends React.Component {
  
  data = {
    origin: [],
    chart: {},
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
    this.data.chart = {};
    
    // Get source from remote repo
    let ret = await getSource();
    ret.split('\n').forEach(line => {
      if (! line) return;
      this.data.origin.push(JSON.parse(line));
    });
    if (this.data.origin.length === 0) return;
   
    // Reverse array to descending order for CSV and table
    this.data.origin.reverse();

    //--------------------------------- CSV ---------------------------------//
    // Construct raw data for CSV of market data
    this.data.csvMarketData[keyMerged] = [];
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
    Object.keys(this.data.csvMarketData).forEach(v => {
      this.data.csvMarketData[keyMerged] = this.data.csvMarketData[keyMerged].concat(this.data.csvMarketData[v]);
    });
    this.data.csvMarketData[keyMerged].sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
    
    // Construct raw data for CSV of ohlcv
    this.data.csvOhlcvData[keyMerged] = [];
    constants.target.quotes.forEach(quote => {
      this.data.csvOhlcvData[quote] = this.data.origin
        .filter(e => e.msg === constants.gather.ohlcv
                && e.symbol === constants.target.symbol
                && e.convert === quote)
        .map(e => getOhlcvCSV(e, this.data.csvMarketData));
    });
    Object.keys(this.data.csvOhlcvData).forEach(v => {
      this.data.csvOhlcvData[keyMerged] = this.data.csvOhlcvData[keyMerged].concat(this.data.csvOhlcvData[v]);
    });
    this.data.csvOhlcvData[keyMerged].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

    //--------------------------------- Chart ---------------------------------//
    // Construct raw data for price & volume chart
    var labels = {}, prices = {}, volumes = {};
    constants.target.quotes.forEach(v => { labels[v] = []; prices[v] = []; volumes[v] = [] });
    this.data.origin
      .filter(e => e.msg === constants.gather.cryptoQuote && e.symbol === constants.target.symbol)
      .forEach(e => {
      constants.target.quotes.forEach(v => {
        labels[v].push(e.time);
        prices[v].push(e.quote[v].price);
        volumes[v].push(e.quote[v].volume_24h);
      });
    });
    constants.target.quotes.forEach(v => {
      this.data.chart[v] = lineChartWithPriceVolume(labels[v], prices[v], volumes[v]);
    });

    // Construct raw data for close chart
    var cLabel = [], cClose = [], cVolume = [];
    var prevMonday = new Date();
    prevMonday.setDate(prevMonday.getDate() - 7 - (prevMonday.getDay() + 6) % 7);
    var prevSunday = new Date();
    prevSunday.setDate(prevMonday.getDate() + 6);
    this.data.origin
      .filter(e => e.msg === constants.gather.ohlcv
              && Date.parse(e.ctime) >= prevMonday.getTime()
              && Date.parse(e.ctime) < prevSunday.getTime()
              && e.symbol === constants.target.symbol
              && e.convert === 'USD')
      .forEach(e => {
        cLabel.push(e.ctime);
        cClose.push(e.quote.close);
        cVolume.push(e.quote.volume);
      });
    this.data.chart['close'] = lineChartWithCloseVolume(cLabel, cClose, cVolume);

    // Construct raw data for market volume chart
    var marketVolumes = this.data.csvOhlcvData['USD']
      .filter(e => Date.parse(e.date) >= prevMonday.getTime()
              && Date.parse(e.date) < prevSunday.getTime())
      .reverse();

    this.data.chart['market'] = barChartWithVolumes(marketVolumes);
    
    //--------------------------------- Table ---------------------------------//
    // Construct raw data for token metric table
    var tokenMetric = this.data.origin.filter(e => e.msg === constants.gather.tokenMetric && e.symbol === constants.target.symbol);
    if (tokenMetric.length > 0) tokenMetric = tokenMetric.slice(0, 1);

    // Construct raw data for market data table
    var marketData = [];
    Object.keys(this.data.csvMarketData).filter(k => k !== keyMerged).forEach(k => {
      if (this.data.csvMarketData[k].length > 0) marketData.push(this.data.csvMarketData[k][0]);
    });
    
    // Construct raw data for ohlcv table
    var ohlcvData = [];
    Object.keys(this.data.csvOhlcvData).filter(k => k !== keyMerged).forEach(k => {
      if (this.data.csvOhlcvData[k].length > 0) ohlcvData.push(this.data.csvOhlcvData[k][0]);
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
              className='csv'
            >
              <CloudDownload /> Token metric
            </CSVLink>
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
                className='csv'
              >
                <CloudDownload /> {market}
              </CSVLink>
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
                className='csv'
              >
                <CloudDownload /> {quote}
              </CSVLink>
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
    </div>;
  }

  getChartRender() {
    return <div>
      <h3>Chart</h3>
      {this.state.ready &&
        <div>
          <Row>
            <Col span={23}>
              <Line
                data={this.data.chart[constants.target.quotes[0]]}
                options={lineChartOptions(constants.target.symbol + '/' + constants.target.quotes[0] + ' Price & Volume')}
              />
            </Col>
          </Row>
          <Row>
            <Col span={11}>
              <Line
                data={this.data.chart['close']}
                options={lineChartOptions('Weekly close & volume (unit: USD)')}
              />
            </Col>
            <Col span={11} offset={1}>
              <Bar
                data={this.data.chart['market']}
                options={barChartOptions('Weekly market volume (unit: USD)')}
              />
            </Col>
          </Row>
        </div>
      }
    </div>
  }

  render() {
    return (
      <Layout className='layout'>
        <Layout.Header>
          Header
        </Layout.Header>
        <Layout.Content style={{ padding: '5vh 5vw 0vh 5vw', backgroundColor: '#fff', minHeight: '70vh' }}>
          {this.state.ready ?
            <div>
              {this.getTokenMetricRender()}
              <br />
              {this.getMarketDataRender()}
              <br />
              {this.getOhlcvRender()}
              <br />
              {this.getChartRender()}
            </div>
            :
            <center>
              <h1>Loading...</h1>
              <ReactLoading type='spin' color='#1DA57A' height='20vh' width='20vw' />
            </center>
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