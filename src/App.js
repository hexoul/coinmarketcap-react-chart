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
    csv: {
      market: {},
      ohlcv: {},
      balance: {},
    },
    searchDate: {},
    searchTime: {},
  };

  state = {
    ready: false,
    tokenMetric: [],
    marketData: [],
    ohlcvData: [],
    balanceData: [],
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
    this.data.origin.sort((a, b) => Date.parse(b.time) - Date.parse(a.time));

    //--------------------------------- CSV ---------------------------------//
    // Construct raw data for CSV of market data
    this.data.csv.market[keyMerged] = [];
    this.data.csv.market['CMC'] = this.data.origin
      .filter(e => e.msg === constants.gather.cryptoQuote && e.symbol === constants.target.symbol)
      .map(e => { e.market = 'CMC'; return getMarketDataCSV(e); });
    constants.target.markets.forEach(market => {
      this.data.csv.market[market] = this.data.origin
        .filter(e => e.msg === constants.gather.marketPairs
                && e.symbol === constants.target.symbol
                && e.market === market)
        .map(e => getMarketDataCSV(e));
    });
    Object.keys(this.data.csv.market).forEach(v => {
      this.data.csv.market[keyMerged] = this.data.csv.market[keyMerged].concat(this.data.csv.market[v]);
    });
    this.data.csv.market[keyMerged].sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
    
    // Construct raw data for CSV of ohlcv
    this.data.csv.ohlcv[keyMerged] = [];
    constants.target.quotes.forEach(quote => {
      this.data.csv.ohlcv[quote] = this.data.origin
        .filter(e => e.msg === constants.gather.ohlcv
                && e.symbol === constants.target.symbol
                && e.convert === quote)
        .map(e => getOhlcvCSV(e, this.data.csv.market));
    });
    Object.keys(this.data.csv.ohlcv).forEach(v => {
      this.data.csv.ohlcv[v].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
      this.data.csv.ohlcv[keyMerged] = this.data.csv.ohlcv[keyMerged].concat(this.data.csv.ohlcv[v]);
    });
    this.data.csv.ohlcv[keyMerged].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

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
    var thisMonday = new Date();
    thisMonday.setDate(thisMonday.getDate() - (thisMonday.getDay() + 6) % 7);
    this.data.origin
      .filter(e => e.msg === constants.gather.ohlcv
              && Date.parse(e.ctime) >= prevMonday.getTime()
              && Date.parse(e.ctime) < thisMonday.getTime()
              && e.symbol === constants.target.symbol
              && e.convert === 'USD')
      .forEach(e => {
        cLabel.push(e.ctime);
        cClose.push(e.quote.close);
        cVolume.push(e.quote.volume);
      });
    this.data.chart['close'] = lineChartWithCloseVolume(cLabel, cClose, cVolume);

    // Construct raw data for market volume chart
    prevMonday.setDate(prevMonday.getDate() -1);
    var marketVolumes = this.data.csv.ohlcv['USD']
      .filter(e => Date.parse(e.date) >= prevMonday.getTime()
              && Date.parse(e.date) < thisMonday.getTime())
      .reverse();

    this.data.chart['market'] = barChartWithVolumes(marketVolumes);
    
    //--------------------------------- Table ---------------------------------//
    // Construct raw data for token metric table
    var tokenMetric = this.data.origin.filter(e => e.msg === constants.gather.tokenMetric && e.symbol === constants.target.symbol);
    if (tokenMetric.length > 0) tokenMetric = tokenMetric.slice(0, 1);

    // Construct raw data for market data table
    var marketData = [];
    Object.keys(this.data.csv.market).filter(k => k !== keyMerged).forEach(k => {
      if (this.data.csv.market[k].length > 0) marketData.push(this.data.csv.market[k][0]);
    });
    
    // Construct raw data for ohlcv table
    var ohlcvData = [];
    Object.keys(this.data.csv.ohlcv).filter(k => k !== keyMerged).forEach(k => {
      if (this.data.csv.ohlcv[k].length > 0) ohlcvData.push(this.data.csv.ohlcv[k][0]);
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
        Object.keys(this.data.csv.market).forEach(k => {
          if (k === keyMerged) return;
          var found = this.data.csv.market[k].filter(v => Date.parse(v.time) <= searchTime);
          if (found.length > 0) marketData.push(found[0]);
        });
        this.setState({ marketData: marketData });
        break;
      case constants.key.ohlcvData:
        searchTime = Date.parse(this.data.searchDate[target])
        var ohlcvData = [];
        Object.keys(this.data.csv.ohlcv).forEach(k => {
          if (k === keyMerged) return;
          var found = this.data.csv.ohlcv[k].filter(v => Date.parse(v.date) <= searchTime);
          if (found.length > 0) ohlcvData.push(found[0]);
        });
        this.setState({ ohlcvData: ohlcvData });
        break;
      default: break;
    }
  }

  getTokenMetricRender() {
    return <div>
      {this.state.ready &&
      <div>
        <Row justify='center' type='flex'>
          <Col span={4}><h3>Token Metric</h3></Col>
          <Col span={20}>
            <DatePicker format='YYYY/MM/DD' onChange={(d, ds) => this.onSearchByTime(constants.key.tokenMetric, true, ds)} />
            {' '}<TimePicker format='HH:mm:ss' onChange={(t, ts) => this.onSearchByTime(constants.key.tokenMetric, false, ts)} />
          </Col>
        </Row>
        <br />
        <Row justify='center' type='flex' className='csvBg'>
          <Col span={2}>
            CSV Download:
          </Col>
          <Col span={20} offset={1}>
            <CSVLink
              filename='token-metric.csv'
              headers={csvHeaders.tokenMetric}
              data={this.data.origin.filter(e => e.msg === constants.gather.tokenMetric && e.symbol === constants.target.symbol)}
              className='csv'
            >
              <CloudDownload /> Token metric
            </CSVLink>
          </Col>
        </Row>
        <br />
        <Table
          size='small'
          style={{ minWidth: '500px', maxWidth: '1000px' }}
          pagination={false}
          rowKey={record => record.symbol}
          columns={columns.TokenMetric}
          dataSource={this.state.tokenMetric}
        />
      </div>
      }
    </div>
  }

  getMarketDataRender() {
    return <div>
      {this.state.ready &&
      <div>
        <Row justify='center' type='flex'>
          <Col span={4}><h3>Market Data</h3></Col>
          <Col span={20}>
            <DatePicker format='YYYY/MM/DD' onChange={(d, ds) => this.onSearchByTime(constants.key.marketData, true, ds)} />
            {' '}<TimePicker format='HH:mm:ss' onChange={(t, ts) => this.onSearchByTime(constants.key.marketData, false, ts)} />
          </Col>
        </Row>
        <br />
        <Row justify='center' type='flex' className='csvBg'>
          <Col span={2}>
            CSV Download:
          </Col>
          <Col span={20} offset={1}>
          {
            Object.keys(this.data.csv.market).map(market => {
              return <CSVLink
                key={market}
                filename={'market-data-' + market + '.csv'}
                headers={csvHeaders.marketData}
                data={this.data.csv.market[market]}
                className='csv'
              >
                <CloudDownload /> {market}
              </CSVLink>
            })
          }
          </Col>
        </Row>
        <br />
        <Table
          size='small'
          style={{ minWidth: '1000px' }}
          pagination={false}
          rowKey={record => record.category}
          columns={columns.MarketData}
          dataSource={this.state.marketData}
        />
      </div>
      }
    </div>
  }

  getOhlcvRender() {
    return <div>
      {this.state.ready &&
      <div>
        <Row justify='center' type='flex'>
          <Col span={4}><h3>OHLCV</h3></Col>
          <Col span={20}>
            <DatePicker format='YYYY/MM/DD' onChange={(d, ds) => this.onSearchByTime(constants.key.ohlcvData, true, ds)} />
          </Col>
        </Row>
        <br />
        <Row justify='center' type='flex' className='csvBg'>
          <Col span={2}>
            CSV Download:
          </Col>
          <Col span={20} offset={1}>
          {
            Object.keys(this.data.csv.ohlcv).map(quote => {
              return <CSVLink
                key={quote}
                filename={'ohlcv-' + quote + '.csv'}
                headers={csvHeaders.ohlcvData}
                data={this.data.csv.ohlcv[quote]}
                className='csv'
              >
                <CloudDownload /> {quote}
              </CSVLink>
            })
          }
          </Col>
        </Row>
        <br />
        <Table
          size='small'
          style={{ minWidth: '1500px' }}
          pagination={false}
          rowKey={record => record.unit}
          columns={columns.Ohlcv}
          dataSource={this.state.ohlcvData}
        />
      </div>
      }
    </div>
  }

  getBalanceRender() {
    return <div>
      {this.state.ready &&
      <div>
        <Row justify='center' type='flex'>
          <Col span={4}><h3>Balance</h3></Col>
          <Col span={20}>
            <DatePicker format='YYYY/MM/DD' onChange={(d, ds) => this.onSearchByTime(constants.key.balanceData, true, ds)} />
          </Col>
        </Row>
        <br />
        <Row justify='center' type='flex' className='csvBg'>
          <Col span={2}>
            CSV Download:
          </Col>
          <Col span={20} offset={1}>
          {
            Object.keys(this.data.csv.balance).map(quote => {
              return <CSVLink
                key={quote}
                filename={'balance-' + quote + '.csv'}
                headers={csvHeaders.balanceData}
                data={this.data.csv.balance[quote]}
                className='csv'
              >
                <CloudDownload /> {quote}
              </CSVLink>
            })
          }
          </Col>
        </Row>
        <br />
        <Table
          size='small'
          style={{ minWidth: '1000px' }}
          pagination={false}
          rowKey={record => record.unit}
          columns={columns.Balance}
          dataSource={this.state.balanceData}
        />
      </div>
      }
    </div>
  }

  getChartRender() {
    return <div>
      <h3>Chart</h3>
      {this.state.ready &&
        <div>
          <Row style={{ minWidth: '600px' }}>
            <Col span={23}>
              <Line
                data={this.data.chart[constants.target.quotes[0]]}
                options={lineChartOptions(constants.target.symbol + '/' + constants.target.quotes[0] + ' Price & Volume')}
              />
            </Col>
          </Row>
          <Row style={{ minWidth: '800px' }}>
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
              {this.getBalanceRender()}
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