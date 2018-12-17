# Coinmarketcap Graph
Graph rendering from [go-coinmarketcap](https://github.com/hexoul/go-coinmarketcap)'s statistics log.
In addition, support searchable info table and CSV download.

[![NPM](https://img.shields.io/npm/v/metasdk-react.svg)](https://www.npmjs.com/package/metasdk-react) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Sample
![Sample](https://raw.githubusercontent.com/hexoul/coinmarketcap-react-chart/master/sample.png)

## Preview

```bash
$ npm install
$ npm start
```

## Deploy

```bash
$ npm run build
$ npm install -g serve
$ serve -l 3003 -s build
```

## Log format
Log will be automatically piled by [go-cryptoinfo-gather](https://github.com/hexoul/go-cryptoinfo-gather) using [go-coinmarketcap](https://github.com/hexoul/go-coinmarketcap). For detail, please refer the repos.

Examples for log format are here
```
// Crypto quote log
{"level":"info","msg":"GatherCryptoQuote","quote":{"BTC":{"price":0.000001983007809502792,"volume_24h":78.77427905807147,"percent_change_1h":1.0903,"percent_change_24h":0.4569,"percent_change_7d":2.5535,"last_updated":"2018-11-09T02:57:11.000Z"},"ETH":{"price":0.00006017736608214104,"volume_24h":2390.524437683829,"percent_change_1h":1.1054,"percent_change_24h":1.1574,"percent_change_7d":-2.9337,"last_updated":"2018-11-09T02:57:45.000Z"},"USD":{"price":0.0127696638893,"volume_24h":507270.350561915,"percent_change_1h":0.942635,"percent_change_24h":-0.504137,"percent_change_7d":3.6068,"last_updated":"2018-11-09T02:58:02.000Z"}},"symbol":"BNB","time":"09-11-2018 11:59:30"}
// OHLCV log
{"convert":"ETH","ctime":"2018-11-13T23:59:59.999Z","level":"info","msg":"GatherOhlcv","quote":{"open":0.00006002451845434587,"high":0.000060496348451225696,"low":0.000058614835602129494,"close":0.000059441868899224505,"volume":2915.677095180455,"timestamp":"2018-11-14T08:30:40.000Z"},"symbol":"META","time":"2018-11-14T17:31:58+09:00"}
// Market pair log
{"level":"info","msg":"GatherExchangeMarketPairs","pair":"BNB/ETH","quote":{"BTC":{"price":0.0000020151027888331716,"volume_24h":9.17888605715876,"last_updated":"2018-11-09T02:57:11.000Z"},"ETH":{"price":0.00006115133668947176,"volume_24h":278.5471564160903,"last_updated":"2018-11-09T02:57:45.000Z"},"USD":{"price":0.0129763408860415,"volume_24h":59107.8306733892,"last_updated":"2018-11-09T02:56:34.000Z"},"exchange_reported":{"price":0.0000611,"volume_24h_base":4555046.07905074,"volume_24h_quote":278.31331543,"last_updated":"2018-11-09T02:56:34.000Z"}},"symbol":"BNB","market":"binance","time":"09-11-2018 11:59:30"}
// Token metric log
{"holders":"2199","level":"info","msg":"GatherTokenMetric","symbol":"BNB","time":"09-11-2018 11:59:44","transfers":"5556","txns":"3545"}
// Balance
{"btc":0.01,"eth":1.23,"exchange":"binance","level":"info","msg":"GatherBalance","time":"2018-11-26T15:56:51+09:00"}
// Trade
{"pair":"BTC-ETH","amount":6970.6757,"createdAt":"2018-11-30T14:11:10+09:00","exchange":"binance","fee":1.23,"level":"info","msg":"GatherTrades","orderID":"5c00c66e78668e5d851ade1a","price":0.00001,"side":"BUY","time":"2018-11-30T14:11:12+09:00","volume":0.001}
```

## What more

- [go-cryptoinfo-gather](https://github.com/hexoul/go-cryptoinfo-gather)
- [go-coinmarketcap](https://github.com/hexoul/go-coinmarketcap)
- [antd](https://github.com/ant-design/ant-design/)
- [babel-plugin-import](http://github.com/ant-design/babel-plugin-import/)
- [create-react-app](https://github.com/facebookincubator/create-react-app)
- [react-app-rewired](https://github.com/timarney/react-app-rewired)
- [less-loader](https://github.com/webpack/less-loader)
